# Deployment Guide

This application is containerized using Docker, making it easy to deploy to almost any cloud provider.

## Option 1: Render (Recommended for ease of use)

Render is excellent for this project because it has native Docker support and a generous free tier.

### Steps:
1.  **Push your code to GitHub/GitLab**.
2.  Log in to [Render.com](https://render.com).
3.  Click **New +** -> **Web Service**.
4.  Connect your repository.
5.  Select the repository `ai_dev_tools_zoomcamp`.
6.  **Runtime**: Select **Docker**.
7.  **Root Directory**: Enter `homework/howework_2/real_time_coding_platform`
8.  **Dockerfile Path**: Enter `Dockerfile` (or `./Dockerfile`)
9.  **Environment Variables**:
    *   Add `NODE_ENV` = `production`
10. **Plan**: Select "Free" (or a paid plan for better performance).
11. Click **Create Web Service**.

Render will automatically detect the `Dockerfile`, build your image, and deploy it.

---

## Option 2: Basic VPS (DigitalOcean, Hetzner, AWS EC2)

Since you have a `docker-compose.yaml` file, deploying to a standard Linux server is very straightforward.

### Steps:
1.  **SSH into your server**.
2.  **Install Docker and Git**.
3.  **Clone your repository**:
    ```bash
    git clone https://github.com/samidulloabdullaev/ai_dev_tools_zoomcamp.git
    cd ai_dev_tools_zoomcamp/homework/howework_2/real_time_coding_platform
    ```
4.  **Run with Docker Compose**:
    ```bash
    docker compose up -d --build
    ```
5.  Your app is now running on port `3000`. You can set up Nginx as a reverse proxy to serve it on domain port 80/443.

---

## Important Notes
*   **Persistent Data**: This app currently stores rooms in memory. If the server restarts, room data is lost. For a production app, you would want to connect a database (like Redis) and update the `server/index.js` to persist state.
