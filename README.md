# StayFinder Hotels

A responsive hotel discovery app using the provided Demo Hotels API.

## Features

- Live API integration with `https://demohotelsapi.pythonanywhere.com/hotels/`
- Search by hotel name, city, or keyword
- Filter by location, price range, and minimum rating
- Sort by rating, price, or hotel name
- Responsive hotel cards with photo previews
- Hotel detail dialog with gallery images
- Light and dark theme toggle

## Folder Structure

```text
.
|-- index.html
|-- README.md
`-- src
    |-- css
    |   `-- styles.css
    `-- js
        |-- api.js
        |-- app.js
        `-- utils.js
```

## Run Locally

Use any static web server from the project root. For example:

```bash
python3 -m http.server 5173
```

Then open `http://localhost:5173`.
