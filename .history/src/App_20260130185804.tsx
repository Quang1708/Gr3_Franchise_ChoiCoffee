import { Suspense } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import ClientAuthRoutes from "./routes/client/ClientAuth.route"
import { ClientPublicRoutes } from "./routes/client/ClientPublic.route"
import NotFoundPage from "./pages/NotFoundPage.page"

function App() {

  return (
    <BrowserRouter>
      <Suspense fallback = {<div>Loading...</div>}>
        <Routes>
           {/* Admin */}

          {/* Client */}
           {ClientAuthRoutes}
           {ClientPublicRoutes}

           <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
