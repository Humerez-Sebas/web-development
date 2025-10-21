import { initializeApp } from 'firebase-admin/app'
import { setGlobalOptions } from 'firebase-functions/v2'

/**
 * Inicializa Admin SDK una sola vez para todas las funciones
 * y fija región global (evita repetir { region: 'us-central1' } en cada handler).
 */
initializeApp()
setGlobalOptions({ region: 'us-central1' })
