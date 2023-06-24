package entity
// Order Queue Entity has the data to define a Queue to the orders (Orders [])
// Orders is a slice using a pointer
// This entity is used to match the orders
type OrderQueue struct {
	Orders []*Order
}

// Business logic to return True or False if the first order is cheaper than the second
func (oq *OrderQueue) Less(i, j int) bool {
	return oq.Orders[i].Price < oq.Orders[j].Price
}

// Business logic to swap the sequence of the orders
func (oq *OrderQueue) Swap(i, j int) {
	oq.Orders[i], oq.Orders[j] = oq.Orders[j], oq.Orders[i]
}

// Business logic to return the number of itens in the queue
func (oq *OrderQueue) Len() int {
	return len(oq.Orders)
}

// Business logic to add an order in the queue
func (oq *OrderQueue) Push(x interface{}) {
	oq.Orders = append(oq.Orders, x.(*Order))
}

// Business logic to return the last item in the queue e remove from the queue
func (oq *OrderQueue) Pop() interface{} {
	old := oq.Orders
	n := len(old)
	item := old[n-1]
	oq.Orders = old[0 : n-1]
	return item
}

// Business logic to create a new queue and return the first position on the pointer
func NewOrderQueue() *OrderQueue {
	return &OrderQueue{}
}
