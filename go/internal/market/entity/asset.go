package entity

// DDD is not an architectural approach, it is a software design discipline
// Entity is a pattern used in DDD (Domain Driven Design)
// A domain entity in DDD must implement the domain logic or behavior related to the entity data
// As part of an entity class we must have business logic and operations implemented as methods for tasks
// Entities has all the data and business logic for it
// Domain Entity:An object that is identified by its consistent thread of continuity, as opposed to traditional objects, which are defined by their attributes.

// Asset Entity has the data to define an Asset (Id,Name, MarketVolume)
// and the only business logic is a NewAsset creation data are from the method input
type Asset struct {
	ID           string
	Name         string
	MarketVolume int
}

func NewAsset(id string, name string, marketVolume int) *Asset {
	return &Asset{
		ID:           id,
		Name:         name,
		MarketVolume: marketVolume,
	}
}
