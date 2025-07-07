# OwnMyHealth

A web application to upload and visualize your Apple Health data. Get insights into your health metrics, view correlations, and explore time-series trends.

This project was bootstrapped with Create React App and uses TypeScript, Tailwind CSS, and Recharts.

## Running the Backend

This frontend requires the companion FastAPI backend to be running. Please follow the instructions for the backend service to start it on `http://localhost:8000`.

## Running the Frontend Locally

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start the development server:**
    ```bash
    npm start
    ```
    This will open the application in your default browser at `http://localhost:3000`.

## Deploying to GitHub Pages

You can easily deploy this application to GitHub Pages.

1.  **Install `gh-pages`:**
    ```bash
    npm install --save-dev gh-pages
    ```

2.  **Update `package.json`:**

    Open your `package.json` file and add the following properties:

    a. At the top level, add a `homepage` property. Replace `your-github-username` and `your-repo-name` with your actual GitHub username and repository name.

    ```json
    "homepage": "https://your-github-username.github.io/your-repo-name",
    ```

    b. Inside the `scripts` object, add `predeploy` and `deploy` scripts:

    ```json
    "scripts": {
      // ... other scripts like start, build, test, eject
      "predeploy": "npm run build",
      "deploy": "gh-pages -d build"
    },
    ```

3.  **Deploy the application:**

    Run the deploy script from your project's root directory:
    ```bash
    npm run deploy
    ```
    This command will first build your application for production and then publish the contents of the `build` folder to a `gh-pages` branch on your GitHub repository.

4.  **Configure GitHub Repository:**

    - Go to your repository's settings on GitHub.
    - Navigate to the "Pages" section in the left sidebar.
    - Under "Build and deployment", for the "Source", select "Deploy from a branch".
    - Set the branch to `gh-pages` and the folder to `/(root)`.
    - Save the changes.

Your application should now be live at the URL you specified in the `homepage` field!
