package expense

import "time"

// Category is a spending category. Go has no real enum, so the idiom is a
// named string type plus a set of typed constants.
type Category string

const (
	CategoryFood           Category = "Food"
	CategoryTransportation Category = "Transportation"
	CategoryEntertainment  Category = "Entertainment"
	CategoryShopping       Category = "Shopping"
	CategoryBills          Category = "Bills"
	CategoryOther          Category = "Other"
)

var validCategories = map[Category]bool{
	CategoryFood:           true,
	CategoryTransportation: true,
	CategoryEntertainment:  true,
	CategoryShopping:       true,
	CategoryBills:          true,
	CategoryOther:          true,
}

func (c Category) Valid() bool {
	return validCategories[c]
}

// Expense is a single spending record owned by a user.
//
// UserID is tagged `json:"-"` so it is never serialized to the client: the
// caller already knows who they are (from their token), and we don't leak
// internal ownership ids. Money is stored as integer cents, never float.
type Expense struct {
	ID          string    `json:"id"`
	UserID      string    `json:"-"`
	Date        string    `json:"date"`        // ISO date, YYYY-MM-DD
	AmountCents int64     `json:"amountCents"` // e.g. $12.34 -> 1234
	Category    Category  `json:"category"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
}
