Welcome to your new TanStack Start app!

# Getting Started

To run this application:

```bash
npm install
npm run dev
```

# Database

Products and stock live in Postgres, accessed with Drizzle. Categories stay in code (`src/data/products.ts`).

```bash
cp .env.example .env        # set DATABASE_URL
createdb teesolar
pnpm db:migrate             # apply migrations in drizzle/
pnpm db:seed                # load the starter catalog (safe to re-run)
```

- Schema: `src/db/schema.ts`. After changing it, run `pnpm db:generate` and then `pnpm db:migrate`.
- Server functions: `src/server/products.ts`. Query options and mutations: `src/queries/products.ts`.
- Every stock change is written to `stock_movements`, and `products.stock` is updated in the same transaction.
- `pnpm db:studio` opens Drizzle Studio for browsing the data.

# Admin panel

`/admin` is the admin panel: dashboard, products, stock history, users and your account. Sign-in uses Better Auth (email and password). Public sign-up is off; people join through invite links.

```bash
pnpm admin:invite you@example.com   # prints a one-time admin invite link (first admin, or recovery)
```

| Role    | Can do |
|---------|--------|
| Admin   | Everything, including inviting, suspending and removing users |
| Manager | Add, edit and delete products; record stock |
| Staff   | Record sales, restocks and returns; view products |

- Roles and permissions: `src/lib/permissions.ts`. Server functions check them with `requirePermission()` (`src/server/auth.ts`), so hiding a button in the UI is never the only protection.
- Invite links are valid for 7 days and work once. Only a hash is stored, so an admin who loses a link makes a new one ("New link" on the Users page).
- `BETTER_AUTH_URL` must match the URL the site is served from. Invite links are built from it.
- A role change can take up to 5 minutes to show in the other person's menu (session cookie cache). Server-side checks apply straight away.

## Product photos (Cloudinary)

Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` in `.env` (Cloudinary console → Settings → API Keys), then restart the dev server. Without them, the uploader says uploads aren't set up.

- The browser uploads straight to Cloudinary using a signature from `signProductUpload` (`src/server/products.ts`). The API secret stays on the server, and only managers and admins can get a signature.
- Uploads go to the `teesolar/products` folder. A product can have up to 12 photos; the first is the main photo.
- Photos removed from a product (or belonging to a deleted product) are deleted from Cloudinary after the save. Only files in that folder are ever deleted.
- `imageUrl()` (`src/lib/image-url.ts`) adds `f_auto,q_auto` and a width to each URL, so each page gets a WebP/AVIF at the size it needs.

# Building For Production

To build this application for production:

```bash
npm run build
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

### Removing Tailwind CSS

If you prefer not to use Tailwind CSS:

1. Remove the demo pages in `src/routes/demo/`
2. Replace the Tailwind import in `src/styles.css` with your own styles
3. Remove `tailwindcss()` from the plugins array in `vite.config.ts`
4. Remove `@tailwindcss/vite` and `tailwindcss` from `package.json`

## Linting & Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting. The following scripts are available:


```bash
npm run lint
npm run format
npm run check
```



## Routing

This project uses [TanStack Router](https://tanstack.com/router) with file-based routing. Routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you render `{children}` in the `shellComponent`.

Here is an example layout that includes a header:

```tsx
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My App' },
    ],
  }),
  shellComponent: ({ children }) => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <header>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </nav>
        </header>
        {children}
        <Scripts />
      </body>
    </html>
  ),
})
```

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Server Functions

TanStack Start provides server functions that allow you to write server-side code that seamlessly integrates with your client components.

```tsx
import { createServerFn } from '@tanstack/react-start'

const getServerTime = createServerFn({
  method: 'GET',
}).handler(async () => {
  return new Date().toISOString()
})

// Use in a component
function MyComponent() {
  const [time, setTime] = useState('')
  
  useEffect(() => {
    getServerTime().then(setTime)
  }, [])
  
  return <div>Server time: {time}</div>
}
```

## API Routes

You can create API routes by using the `server` property in your route definitions:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: () => json({ message: 'Hello, World!' }),
    },
  },
})
```

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/people')({
  loader: async () => {
    const response = await fetch('https://swapi.dev/api/people')
    return response.json()
  },
  component: PeopleComponent,
})

function PeopleComponent() {
  const data = Route.useLoaderData()
  return (
    <ul>
      {data.results.map((person) => (
        <li key={person.name}>{person.name}</li>
      ))}
    </ul>
  )
}
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).



# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).

For TanStack Start specific documentation, visit [TanStack Start](https://tanstack.com/start).
