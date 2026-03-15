import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router"
import { RootLayout } from "./routes/RootLayout"
import { HomePage } from "./routes/HomePage"
import { SplashScreen } from "./montagemaker/components/SplashScreen"
import { Editor } from "./montagemaker/components/Editor"
import { PortraitMaker } from "./portraitmaker/components/PortraitMaker"
import { CodexModPage } from "./codexmods/components/CodexModPage"

const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
})

const montageListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/montagemaker",
  component: SplashScreen,
})

const montageEditorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/montagemaker/$montageId",
  component: Editor,
})

const portraitMakerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/popout-avatar-maker",
  component: PortraitMaker,
})

const codexModRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/codex-mods/$modSlug",
  component: CodexModPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  montageListRoute,
  montageEditorRoute,
  portraitMakerRoute,
  codexModRoute,
])

export const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
