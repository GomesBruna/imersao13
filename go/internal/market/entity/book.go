package entity

import (
	"container/heap"
	"fmt"
	"sync"
)

// Book Entity has the data to define the leadger of trades (Order[], Transactions[], OrdersChan, OrdersChanOut, Wg)
// Order is a slice to the orders
// Transactions is a slice to the transactions
// OrdersChan is an input channel for the orders
// OrdersChanOut is an output channel for the orders
// Wg is an wait group
// Channels are a typed conduit through which you can send and receive values by default, sends and receives block until the other side is ready. This allows goroutines to synchronize without explicit locks or condition variables.
// Wait group is used to wait for multiple goroutines to finish, we can use a wait group. Sleep to simulate an expensive task.
// This WaitGroup is used to wait for all the goroutines launched here to finish. Note: if a WaitGroup is explicitly passed into functions, it should be done by pointer.
// A goroutine is a lightweight thread managed by the Go runtime.
type Book struct {
	Order         []*Order
	Transactions  []*Transaction
	OrdersChan    chan *Order // input
	OrdersChanOut chan *Order
	Wg            *sync.WaitGroup
}

// Business logic to create a new book
func NewBook(orderChan chan *Order, orderChanOut chan *Order, wg *sync.WaitGroup) *Book {
	return &Book{
		Order:         []*Order{},
		Transactions:  []*Transaction{},
		OrdersChan:    orderChan,
		OrdersChanOut: orderChanOut,
		Wg:            wg,
	}
}

// Business logic to make a trade -> try to match a buy and a sell order
func (b *Book) Trade() {
	// map is a hash table built-in, in that case is two hash tables string:orderQueue
	buyOrders := make(map[string]*OrderQueue)
	sellOrders := make(map[string]*OrderQueue)
	// buyOrders := NewOrderQueue()
	// sellOrders := NewOrderQueue()

	// heap.Init(buyOrders)
	// heap.Init(sellOrders)

	// loop to read the orders input channel
	for order := range b.OrdersChan {
		asset := order.Asset.ID

		// See if already exists on the hash table an order queue (one to buy and one to sell orders)
		// to the asset, if don't create
		if buyOrders[asset] == nil {
			buyOrders[asset] = NewOrderQueue()
			heap.Init(buyOrders[asset])
		}

		if sellOrders[asset] == nil {
			sellOrders[asset] = NewOrderQueue()
			heap.Init(sellOrders[asset])
		}

		// Trade logic: add the order to the queue (buy or sell depends on the order type)
		// See if have any other type of order (buy or sell) on the other queue and if the price of the first order is <=
		// If we have a match we remove the order matched from the queue, verified if pending shares is > 0
		// after that we create a new transaction, add a transaction to the book, add the transaction to both orders
		// add the sell order and buy order to OrdersChanOut and if the order we remove from the queue has pending shares we add to the queue again
		if order.OrderType == "BUY" {
			buyOrders[asset].Push(order)
			fmt.Println("entrou buy order ID ", string(order.ID))
			if sellOrders[asset].Len() > 0 && sellOrders[asset].Orders[0].Price <= order.Price {
				sellOrder := sellOrders[asset].Pop().(*Order)
				if sellOrder.PendingShares > 0 {
					transaction := NewTransaction(sellOrder, order, order.Shares, sellOrder.Price)
					b.AddTransaction(transaction, b.Wg)
					sellOrder.Transactions = append(sellOrder.Transactions, transaction)
					order.Transactions = append(order.Transactions, transaction)
					b.OrdersChanOut <- sellOrder
					b.OrdersChanOut <- order
					if sellOrder.PendingShares > 0 {
						sellOrders[asset].Push(sellOrder)
					}
				}
			}
		} else if order.OrderType == "SELL" {
			sellOrders[asset].Push(order)
			len_orders := buyOrders[asset].Len()
			fmt.Printf("tamanho total de orders: %v \n", len_orders)
			//if buyOrders[asset].Len() > 0 && buyOrders[asset].Orders[len_orders-1].Price >= order.Price { -- FILO
			if buyOrders[asset].Len() > 0 && buyOrders[asset].Orders[0].Price >= order.Price { // FIFO
				fmt.Println("Entrou if sell")
				buyOrder := buyOrders[asset].Pop().(*Order)
				if buyOrder.PendingShares > 0 {
					transaction := NewTransaction(order, buyOrder, order.Shares, buyOrder.Price)
					b.AddTransaction(transaction, b.Wg)
					buyOrder.Transactions = append(buyOrder.Transactions, transaction)
					order.Transactions = append(order.Transactions, transaction)
					b.OrdersChanOut <- buyOrder
					b.OrdersChanOut <- order
					if buyOrder.PendingShares > 0 {
						buyOrders[asset].Push(buyOrder)
					}
				}
			}
		}
	}
}

// Business logic to make add a transaction
func (b *Book) AddTransaction(transaction *Transaction, wg *sync.WaitGroup) {
	// after done close de wait group
	defer wg.Done()

	sellingShares := transaction.SellingOrder.PendingShares
	buyingShares := transaction.BuyingOrder.PendingShares

	// find what order has less shares
	minShares := sellingShares
	if buyingShares < minShares {
		minShares = buyingShares
	}

	// Update asset position in the investor entity (investor selling)
	transaction.SellingOrder.Investor.UpdateAssetPosition(transaction.SellingOrder.Asset.ID, -minShares)
	// change the pending shares on sell order
	transaction.AddSellOrderPendingShares(-minShares)

	// Update asset position in the investor entity (investor buying)
	transaction.BuyingOrder.Investor.UpdateAssetPosition(transaction.BuyingOrder.Asset.ID, minShares)
	// change the pending shares on buy order
	transaction.AddBuyOrderPendingShares(-minShares)

	// calculate total pricing on the transaction
	transaction.CalculateTotal(transaction.Shares, transaction.BuyingOrder.Price)
	// try close the buy order
	transaction.CloseBuyOrder()
	// try close the sell order
	transaction.CloseSellOrder()
	// add transaction on the book
	b.Transactions = append(b.Transactions, transaction)
}
