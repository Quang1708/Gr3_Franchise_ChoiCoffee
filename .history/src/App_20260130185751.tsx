import { Suspense } from "react"
import { BrowserRouter, Routes } from "react-router-dom"
import ClientAuthRoutes from "./routes/client/ClientAuth.route"
import { ClientPublicRoutes } from "./routes/client/ClientPublic.route"

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
