
import { Navigate, useLocation } from 'react-router-dom'
import type { UserSummary, Role } from '@/lib/types'
import { postLogin, postLogout } from '@/lib/api/endpoints'


interface Session { token: string; user: UserSummary }
interface Ctx {
session: Session | null
login: (email: string, password: string) => Promise<Session>
logout: () => Promise<void>
}


const AuthCtx = createContext<Ctx | null>(null)
export function useAuth(){
const ctx = useContext(AuthCtx)
if(!ctx) throw new Error('useAuth must be used within AuthProvider')
return ctx
}


export function AuthProvider({ children }: { children: React.ReactNode }){
const [session, setSession] = useState<Session | null>(()=>{
const raw = localStorage.getItem('t99.jwt')
return raw ? JSON.parse(raw) as Session : null
})


async function login(email: string, password: string){
const res = await postLogin({ email, password })
const next = { token: res.token, user: res.user }
localStorage.setItem('t99.jwt', JSON.stringify(next))
setSession(next)
return next
}
async function logout(){
try{ await postLogout() } catch {}
localStorage.removeItem('t99.jwt')
setSession(null)
}


const value = useMemo(()=>({ session, login, logout }), [session])
return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}


export function RequireAuth({ role, children }: { role?: Role; children: React.ReactNode }){
const { session } = useAuth()
const location = useLocation()
if(!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />
if(role && session.user.role !== role) return <Navigate to="/" replace />
return <>{children}</>
}
