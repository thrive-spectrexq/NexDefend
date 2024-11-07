package threat

// EventStore defines an interface for storing Suricata events
type EventStore interface {
	StoreSuricataEvent(event SuricataEvent) error
}
