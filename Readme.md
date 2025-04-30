# Subsidia

Subsidia is a web application designed for farm management. It helps farmers track employees, workdays, salaries, land usage, harvests, and associated earnings. The application provides a dashboard overview and dedicated modules for detailed management.

**Live Demo:** Access the deployed application at [https://subsidia.app](https://subsidia.app)

## Features

*   **Dashboard:** Provides a quick overview of key statistics for employees (active workers, total workdays, total payroll) and harvests (cultivated area, total yield, total earnings).
*   **Employee Management:** Track farm workers, record their workdays, and manage payroll calculations.
*   **Harvest Management:** Log harvest details, including yield amounts and earnings.
*   **Land Management:** Visualize and manage farm plots (likely using map features).
*   **Calendar/Scheduling:** Plan and track farm activities.
*   **Authentication:** Secure login system for users.

## Screenshots

*(Add screenshots of the application here. Examples:)*

**Dashboard:**
![Dashboard](/placeholders/placeholder-dashboard.png)

**Employee Management:**
![Employee Management](/placeholders/placeholder-employee-single.png)
![](/placeholders/placeholder-salaries.png)

**Harvest Tracking:**
![Harvest Tracking](/placeholders/placeholder-harvest.png)

**Land Mapping:**
![Land Mapping](/placeholders/placeholder-lands.png)

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (v15) with App Router
*   **Language:** JavaScript
*   **UI Library:** [React](https://reactjs.org/) (v19)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (v4)
*   **UI Components:** [Shadcn UI](https://ui.shadcn.com/) (using Radix UI primitives)
*   **Database ORM:** [Prisma](https://www.prisma.io/)
*   **Authentication:** [NextAuth.js](https://next-auth.js.org/)
*   **Mapping:** [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/)
*   **Forms:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
*   **API Client:** [Axios](https://axios-http.com/)
*   **Email:** [React Email](https://react.email/) & [Resend](https://resend.com/)
*   **Deployment:** Likely [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm, yarn, or bun
*   A PostgreSQL database instance

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/subsidia.git
    cd subsidia/subsidia 
    ```
    *(Note: The main code is in the `subsidia/` subdirectory)*

2.  **Install dependencies:**
    ```bash
    npm install 
    # or
    yarn install
    # or
    bun install 
    ```

3.  **Set up environment variables:**
    *   Copy the example environment file: `cp .env.example .env`
    *   Edit the `.env` file and provide the necessary values, especially for:
        *   `DATABASE_URL`: Your PostgreSQL connection string (e.g., `postgresql://user:password@host:port/database`)
        *   `NEXTAUTH_URL`: The base URL of your application (e.g., `http://localhost:3000` for development)
        *   `NEXTAUTH_SECRET`: A secret key for NextAuth.js (generate one using `openssl rand -base64 32`)
        *   Mapbox access token, Resend API key, etc.

4.  **Apply database migrations:**
    ```bash
    npx prisma migrate dev
    # or
    bunx prisma migrate dev
    ```
    This will also generate the Prisma Client. If you only need to generate the client later, run `npx prisma generate`.

5.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or 
    bun run dev
    ```
    The application should now be running at `http://localhost:3000`.

## Usage

After starting the application:

1.  Navigate to `http://localhost:3000`.
2.  You will be redirected to the login page.
3.  Use your credentials to log in (you might need to implement user registration or seeding first depending on the current state).
4.  Upon successful login, you will be redirected to the dashboard.
5.  Explore the different modules (Employees, Harvests, Lands, Calendar) using the navigation links (likely in a sidebar or header, not shown in the dashboard code snippet).

## Contributing

Contributions are welcome! Please follow standard open-source practices: fork the repository, create a feature branch, make your changes, and submit a pull request. Ensure your code follows the project's linting rules (`npm run lint`).

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
