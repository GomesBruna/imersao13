package entity

import (
	"time"

	"github.com/google/uuid"
)

// Transaction Entity has the data to define a Transaction (Id, SellingOrder, BuyingOrder, Shares, Price, Total, Datetime)
type Transaction struct {
	ID           string
	SellingOrder *Order
	BuyingOrder  *Order
	Shares       int
	Price        float64
	Total        float64
	DateTime     time.Time
}

// Business logic of a NewTransaction creation, ID is create using de uuid library (from google)
// DateTime is create using de time library with de Date and Time from now
// Tota is calculate using shares * price
// others data are from the method input
func NewTransaction(sellingOrder *Order, buyingOrder *Order, shares int, price float64) *Transaction {
	total := float64(shares) * price
	return &Transaction{
		ID:           uuid.New().String(),
		SellingOrder: sellingOrder,
		BuyingOrder:  buyingOrder,
		Shares:       shares,
		Price:        price,
		Total:        total,
		DateTime:     time.Now(),
	}
}

// Business logic to calculate total cost with shares (from input) * price (from input)
func (t *Transaction) CalculateTotal(shares int, price float64) {
	t.Total = float64(t.Shares) * t.Price
}

// Business logic to close a buy order, where we change the order status to CLOSED
// today is the same of the close sell order but two methods allow us to applied the single responsability from SOLID
func (t *Transaction) CloseBuyOrder() {
	if t.BuyingOrder.PendingShares == 0 {
		t.BuyingOrder.Status = "CLOSED"
	}
}

// Business logic to close a sell order, where we change the order status to CLOSED
// today is the same of the close buy order but two methods allow us to applied the single responsability from SOLID
func (t *Transaction) CloseSellOrder() {
	if t.SellingOrder.PendingShares == 0 {
		t.SellingOrder.Status = "CLOSED"
	}
}

// Business logic to add pending shares to a buy order, where we sum the current pending shares with the input shares
// today is the same of add sell order pending shares but two methods allow us to applied the single responsability from SOLID
func (t *Transaction) AddBuyOrderPendingShares(shares int) {
	t.BuyingOrder.PendingShares += shares
}

// Business logic to add pending shares to a sell order, where we sum the current pending shares with the input shares
// today is the same of add buy order pending shares but two methods allow us to applied the single responsability from SOLID
func (t *Transaction) AddSellOrderPendingShares(shares int) {
	t.SellingOrder.PendingShares += shares
}
