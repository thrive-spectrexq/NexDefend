package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/thrive-spectrexq/NexDefend/internal/dashboard"
)

func SetupRoutes(router *gin.Engine) {
	api := router.Group("/api/v1")
	{
		api.GET("/dashboard", dashboard.GetDashboardData)
	}
}
