package dto

// DTO (Data Transfer Object) - pattern used to encapsulated data between Kafka and the main program
// struct to get the trade input from Kafka, that is the original order
type TradeInput struct {
	OrderID       string  `json:"order_id"`
	InvestorID    string  `json:"investor_id"`
	AssetID       string  `json:"asset_id"`
	CurrentShares int     `json:"current_shares"`
	Shares        int     `json:"shares"`
	Price         float64 `json:"price"`
	OrderType     string  `json:"order_type"`
}

// Struct used to create a new order after a partial transaction
type OrderOutput struct {
	OrderID            string               `json:"order_id"`
	InvestorID         string               `json:"investor_id"`
	AssetID            string               `json:"asset_id"`
	OrderType          string               `json:"order_type"`
	Status             string               `json:"status"`
	Partial            int                  `json:"partial"`
	Shares             int                  `json:"shares"`
	TransactionsOutput []*TransactionOutput `json:"transactions"`
}

// Struct used to create a new transaction after match a buy and a sell order (can be a partial match)
type TransactionOutput struct {
	TransactionID string  `json:"transaction_id"`
	BuyerID       string  `json:"buyer_id"`
	SellerID      string  `json:"seller_id"`
	AssetID       string  `json:"asset_id"`
	Price         float64 `json:"price"`
	Shares        int     `json:"shares"`
}
