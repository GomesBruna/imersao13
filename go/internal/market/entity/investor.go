package entity

// Investor Entity has the data to define an Investor (Id, Name, AssetPosition[])
// Asset Position is a slice using a pointer
// A slice, on the other hand, is a dynamically-sized, flexible view into the elements of an array
// a pointer is an object in many programming languages that stores a memory address
// Slice is possible because using the pointer
type Investor struct {
	ID            string
	Name          string
	AssetPosition []*InvestorAssetPosition
}

// Business logic of a NewInvestor creation, receive an id and return a Investor with an empty slice
func NewInvestor(id string) *Investor {
	return &Investor{
		ID:            id,
		AssetPosition: []*InvestorAssetPosition{},
	}
}

// Business logic of an Add Asset Position, add an asset position to the slice
func (i *Investor) AddAssetPosition(assetPosition *InvestorAssetPosition) {
	i.AssetPosition = append(i.AssetPosition, assetPosition)
}

// Business logic of an Update Asset Position
// make a search in the asset possition slice
// If an asset don't exists it add an asset position
// else it sum the current shares with the qtd Shares
func (i *Investor) UpdateAssetPosition(assetID string, qtdShares int) {
	assetPosition := i.GetAssetPosition(assetID)
	if assetPosition == nil {
		i.AssetPosition = append(i.AssetPosition, NewInvestorAssetPosition(assetID, qtdShares))
	} else {
		assetPosition.Shares += qtdShares
	}
}

// Business logic to search an asset position
// for that it do a loop in the slice
// that is a linear search [Best O(1), Average O(n), Worst O(n)]
func (i *Investor) GetAssetPosition(assetID string) *InvestorAssetPosition {
	for _, assetPosition := range i.AssetPosition {
		if assetPosition.AssetID == assetID {
			return assetPosition
		}
	}
	return nil
}

// Investor Asset Position Entity has the data to define an Asset Position (Asset Id, Shares)
// to be add on the slice of the AssetPosition on the Investor struct
type InvestorAssetPosition struct {
	AssetID string
	Shares  int
}

// Business logic of a NewInvestorAssetPosition creation, receive an asset id and the shares and return the data in a struct instance
func NewInvestorAssetPosition(assetID string, shares int) *InvestorAssetPosition {
	return &InvestorAssetPosition{
		AssetID: assetID,
		Shares:  shares,
	}
}
