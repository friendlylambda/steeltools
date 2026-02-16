import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { RootLayout } from './routes/RootLayout'
import { HomePage } from './routes/HomePage'
import { SplashScreen } from './montagemaker/components/SplashScreen'
import { Editor } from './montagemaker/components/Editor'

const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const montageListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/montagemaker',
  component: SplashScreen,
})

const montageEditorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/montagemaker/$montageId',
  component: Editor,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  montageListRoute,
  montageEditorRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
