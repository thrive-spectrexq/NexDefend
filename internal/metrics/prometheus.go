
package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	IncidentsCreated = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "nexdefend_incidents_created_total",
		Help: "Total number of incidents created.",
	}, []string{"priority"})

	UserLogins = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "nexdefend_user_logins_total",
		Help: "Total number of user logins.",
	}, []string{"status"})

	ActiveAgents = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "nexdefend_active_agents",
		Help: "Number of active agents.",
	})
)
