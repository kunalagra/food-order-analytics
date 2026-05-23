<h1 align="center">
  <br>
  Foodly Intelligence
  <br>
</h1>

<h4 align="center">Your Unified, Privacy-First Food Delivery Analytics Hub</h4>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#how-to-sync">How to Sync</a> •
  <a href="#credits">Credits</a> •
  <a href="#license">License</a>
</p>

## Key Features

* **Comprehensive Financial Insights**: Instantly view your total spent, average order values, and extremes (highest and lowest orders) across platforms.
* **Habits & Activity Metrics**: Track eating habits via interactive hourly time-of-day radial charts, consecutive ordering streaks, and a GitHub-style daily spending heatmap.
* **Culinary Rankings**: Automatically compile list views of your most visited restaurants, favorite dishes, and top-versus-others spending breakdown.
* **Local-First Privacy**: Securely stores your vendor session credentials locally in your browser's IndexedDB. Your cookies never leave your machine or hit any third-party analytics database.
* **Incremental Updates**: Saves time and bandwidth by fetching only new orders since the last successful synchronization.
* **Data Portability**: Features a custom date-range selector to export your complete order history to a CSV file.

## How To Use

To clone and run this application, you'll need [Git](https://git-scm.com), [Node.js](https://nodejs.org/en/download/) (or [Bun](https://bun.sh/) for faster performance), and your delivery credentials. From your command line:

```bash
# Clone this repository
$ git clone https://github.com/kunalagra/food-aggregator

# Go into the repository
$ cd food-aggregator

# Install dependencies
$ bun install # or npm install

# Run the app
$ bun dev # or npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application dashboard in your web browser.

---

## How to Sync

To import your Zomato order history:

1. Open [zomato.com](https://www.zomato.com) in your browser and ensure you are logged in.
2. Open the **Developer Tools** (`Cmd+Option+I` or `F12`) and navigate to the **Application** or **Storage** tab.
3. Under **Cookies**, select `https://www.zomato.com` and locate the values for:
   - `PHPSESSID`
   - `csrf`
   - `zat`
4. Copy the cookie keys and values as a consolidated string (e.g. `PHPSESSID=xxx; csrf=yyy; zat=zzz`).
5. Open Foodly Intelligence, navigate to **Accounts** → **Add Account**, choose Zomato, paste your cookie string, and click **Connect**.
6. Hit the **Sync** button to fetch your history.

---

## Credits

This software uses the following packages/technologies:

- [Next.js](https://nextjs.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [IndexedDB (idb)](https://github.com/jakearchibald/idb)
- [Base UI](https://base-ui.com/)
- [Recharts](https://recharts.org/)

## You may also like...

- [Codegamy](https://github.com/kunalagra/codegamy) - A Complete Coding & Interview Platform
- [MediCall](https://github.com/kunalagra/MediCall) - An AIO Medical platform to connect doctors and patients
- [Sikho](https://github.com/kunalagra/sikho) - Professional Learning Marketplace

## License

AGPL-3
