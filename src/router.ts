import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router"
import { RootLayout } from "./routes/RootLayout"
import { HomePage } from "./routes/HomePage"
import { SplashScreen } from "./montagemaker/components/SplashScreen"
import { Editor } from "./montagemaker/components/Editor"
import { PortraitMaker } from "./portraitmaker/components/PortraitMaker"
import { CodexModPage } from "./codexmods/components/CodexModPage"
import { SplashScreen as NegotiationSplashScreen } from "./negotiationmaker/components/SplashScreen"
import { Editor as NegotiationEditor } from "./negotiationmaker/components/Editor"

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

const negotiationListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/negotiation-maker",
  component: NegotiationSplashScreen,
})

const negotiationEditorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/negotiation-maker/$negotiationId",
  component: NegotiationEditor,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  montageListRoute,
  montageEditorRoute,
  portraitMakerRoute,
  codexModRoute,
  negotiationListRoute,
  negotiationEditorRoute,
])

export const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
