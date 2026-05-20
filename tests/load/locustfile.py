from locust import HttpUser, between, task


class InventoryUser(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def list_inventory(self):
        self.client.get("/api/v1/inventory/?page=1&page_size=20")

    @task(2)
    def dashboard(self):
        self.client.get("/api/v1/dashboard/")

    @task(2)
    def ai_data_overview(self):
        self.client.get("/api/v1/ai-data/overview")

    @task(1)
    def auto_po(self):
        self.client.get("/api/v1/warehouse-automation/auto-po")

    @task(1)
    def slotting(self):
        self.client.get("/api/v1/warehouse-automation/slotting")
