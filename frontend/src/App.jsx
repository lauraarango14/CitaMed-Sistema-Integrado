import { useEffect, useState } from 'react'
import './App.css'

const API_BASE = 'http://localhost:8080'
const API_URL = `${API_BASE}/api/pacientes`
const AUTH_URL = `${API_BASE}/api/auth`

const formularioVacio = {
  nombre: '',
  apellido: '',
  documento: '',
  telefono: '',
  correo: '',
  fechaNacimiento: '',
}

async function solicitarTokenCsrf() {
  const respuesta = await fetch(`${AUTH_URL}/csrf`, {
    credentials: 'include',
  })
  if (!respuesta.ok) throw new Error('No fue posible preparar la sesión segura.')
  const cookie = document.cookie
    .split('; ')
    .find((elemento) => elemento.startsWith('XSRF-TOKEN='))
  if (!cookie) throw new Error('No se pudo obtener el token de seguridad.')
  return decodeURIComponent(cookie.substring('XSRF-TOKEN='.length))
}

function App() {
  const [usuarioActual, setUsuarioActual] = useState(null)
  const [csrfToken, setCsrfToken] = useState('')
  const [verificandoSesion, setVerificandoSesion] = useState(true)
  const [credenciales, setCredenciales] = useState({ usuario: '', contrasena: '' })
  const [mensajeLogin, setMensajeLogin] = useState('')
  const [cargandoLogin, setCargandoLogin] = useState(false)

  const [pacientes, setPacientes] = useState([])
  const [formulario, setFormulario] = useState(formularioVacio)
  const [pacienteEditando, setPacienteEditando] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  const [mostrarRegistroAdmin, setMostrarRegistroAdmin] = useState(false)
  const [nuevoAdmin, setNuevoAdmin] = useState({ usuario: '', contrasena: '' })

  useEffect(() => {
    async function verificarSesion() {
      try {
        const token = await solicitarTokenCsrf()
        setCsrfToken(token)
        const respuesta = await fetch(`${AUTH_URL}/me`, {
          credentials: 'include',
        })
        if (respuesta.ok) {
          const usuario = await respuesta.json()
          setUsuarioActual(usuario)
        }
      } catch {
        setMensajeLogin('No fue posible conectar con el servidor. Verifica que Spring Boot esté ejecutándose.')
      } finally {
        setVerificandoSesion(false)
      }
    }
    verificarSesion()
  }, [])

  async function cargarPacientes() {
    setCargando(true)
    try {
      const respuesta = await fetch(API_URL, { credentials: 'include' })
      if (respuesta.status === 401 || respuesta.status === 403) {
        setUsuarioActual(null)
        throw new Error('Tu sesión terminó. Inicia sesión nuevamente.')
      }
      if (!respuesta.ok) throw new Error('No se pudieron consultar los pacientes.')
      setPacientes(await respuesta.json())
    } catch (error) {
      setMensaje(error.message || 'No fue posible consultar los pacientes.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (usuarioActual) cargarPacientes()
  }, [usuarioActual])

  const pacientesFiltrados = pacientes.filter((paciente) =>
    `${paciente.nombre} ${paciente.apellido} ${paciente.documento}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  )

  function actualizarCampo(evento) {
    const { name, value } = evento.target
    setFormulario((anterior) => ({ ...anterior, [name]: value }))
  }

  function abrirNuevoPaciente() {
    setFormulario(formularioVacio)
    setPacienteEditando(null)
    setMostrarFormulario(true)
    setMensaje('')
  }

  function editarPaciente(paciente) {
    setFormulario({
      nombre: paciente.nombre ?? '',
      apellido: paciente.apellido ?? '',
      documento: paciente.documento ?? '',
      telefono: paciente.telefono ?? '',
      correo: paciente.correo ?? '',
      fechaNacimiento: paciente.fechaNacimiento ?? '',
    })
    setPacienteEditando(paciente.id)
    setMostrarFormulario(true)
    setMensaje('')
  }

  async function guardarPaciente(evento) {
    evento.preventDefault()
    setMensaje('')
    const editando = pacienteEditando !== null
    const url = editando ? `${API_URL}/${pacienteEditando}` : API_URL
    try {
      const respuesta = await fetch(url, {
        method: editando ? 'PUT' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify(formulario),
      })
      if (respuesta.status === 401 || respuesta.status === 403) {
        setUsuarioActual(null)
        throw new Error('Sesión vencida o solicitud no autorizada. Inicia sesión nuevamente.')
      }
      if (!respuesta.ok) {
        throw new Error(editando ? 'No se pudo actualizar el paciente.' : 'No se pudo registrar el paciente.')
      }
      await cargarPacientes()
      setMensaje(editando ? 'Paciente actualizado correctamente.' : 'Paciente registrado correctamente.')
      setFormulario(formularioVacio)
      setPacienteEditando(null)
      setMostrarFormulario(false)
    } catch (error) {
      setMensaje(error.message || 'Ocurrió un error al guardar el paciente.')
    }
  }

  async function eliminarPaciente(id) {
    const confirmar = window.confirm('¿Estás segura de que deseas eliminar este paciente de la base de datos?')
    if (!confirmar) return
    setMensaje('')
    try {
      const respuesta = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'X-XSRF-TOKEN': csrfToken },
      })
      if (respuesta.status === 401 || respuesta.status === 403) {
        setUsuarioActual(null)
        throw new Error('Sesión vencida o solicitud no autorizada. Inicia sesión nuevamente.')
      }
      if (!respuesta.ok) throw new Error('No se pudo eliminar el paciente.')
      await cargarPacientes()
      setMensaje('Paciente eliminado correctamente.')
    } catch (error) {
      setMensaje(error.message || 'Ocurrió un error al eliminar el paciente.')
    }
  }

  async function iniciarSesion(evento) {
    evento.preventDefault()
    setCargandoLogin(true)
    setMensajeLogin('')
    try {
      const token = csrfToken || await solicitarTokenCsrf()
      setCsrfToken(token)
      const respuesta = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': token,
        },
        body: JSON.stringify(credenciales),
      })
      const datos = await respuesta.json()
      if (!respuesta.ok) throw new Error(datos.error || 'No fue posible iniciar sesión.')
      const sesion = await fetch(`${AUTH_URL}/me`, { credentials: 'include' })
      if (!sesion.ok) throw new Error('Se validaron las credenciales, pero no se pudo recuperar la sesión.')
      setUsuarioActual(await sesion.json())
      setCredenciales({ usuario: '', contrasena: '' })
    } catch (error) {
      setMensajeLogin(error.message || 'Error al iniciar sesión.')
    } finally {
      setCargandoLogin(false)
    }
  }

  async function cerrarSesion() {
    try {
      await fetch(`${AUTH_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-XSRF-TOKEN': csrfToken },
      })
    } finally {
      setUsuarioActual(null)
      setPacientes([])
      setMostrarFormulario(false)
      setMostrarRegistroAdmin(false)
      try {
        setCsrfToken(await solicitarTokenCsrf())
      } catch {
        setCsrfToken('')
      }
    }
  }

  async function registrarAdministrador(evento) {
    evento.preventDefault()
    setMensaje('')
    try {
      const respuesta = await fetch(`${AUTH_URL}/registro`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify(nuevoAdmin),
      })
      const datos = await respuesta.json()
      if (!respuesta.ok) throw new Error(datos.error || 'No se pudo registrar el administrador.')
      setMensaje('Administrador registrado correctamente.')
      setNuevoAdmin({ usuario: '', contrasena: '' })
      setMostrarRegistroAdmin(false)
    } catch (error) {
      setMensaje(error.message || 'Ocurrió un error al registrar el administrador.')
    }
  }

  if (verificandoSesion) {
    return <div className="auth-screen"><div className="auth-card"><strong>CitaMed</strong><p>Verificando sesión segura...</p></div></div>
  }

  if (!usuarioActual) {
    return (
      <main className="auth-screen">
        <form className="auth-card" onSubmit={iniciarSesion}>
          <div className="auth-brand-icon">+</div>
          <p className="auth-eyebrow">GESTIÓN MÉDICA</p>
          <h1>Bienvenida a CitaMed</h1>
          <p className="auth-description">Inicia sesión con una cuenta de administrador para acceder al sistema.</p>
          {mensajeLogin && <div className="message auth-message" role="alert">{mensajeLogin}</div>}
          <label>Usuario
            <input autoComplete="username" value={credenciales.usuario} onChange={(e) => setCredenciales((v) => ({ ...v, usuario: e.target.value }))} required />
          </label>
          <label>Contraseña
            <input type="password" autoComplete="current-password" value={credenciales.contrasena} onChange={(e) => setCredenciales((v) => ({ ...v, contrasena: e.target.value }))} required />
          </label>
          <button className="primary-button auth-submit" type="submit" disabled={cargandoLogin}>
            {cargandoLogin ? 'Verificando...' : 'Iniciar sesión'}
          </button>
          <small className="auth-footnote">Acceso exclusivo para administradores autorizados.</small>
        </form>
      </main>
    )
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">+</div>
          <div><strong>CitaMed</strong><span>Gestión médica</span></div>
        </div>
        <p className="menu-label">MENÚ PRINCIPAL</p>
        <nav className="navigation">
          <a href="#inicio" className="nav-item"><span>⌂</span> Inicio</a>
          <a href="#pacientes" className="nav-item active"><span>♙</span> Pacientes</a>
          <a href="#citas" className="nav-item"><span>▦</span> Citas médicas</a>
        </nav>
        <div className="sidebar-footer">
          <div className="avatar">AD</div>
          <div><strong>{usuarioActual.usuario}</strong><span>Administrador</span></div>
        </div>
      </aside>

      <main className="main-content" id="pacientes">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Sistema médico / Pacientes</span>
            <h1>Gestión de pacientes</h1>
            <p>Administra la información de tus pacientes.</p>
          </div>
          <div className="topbar-actions">
            <div className="topbar-status"><span className="status-dot" /> Sesión protegida</div>
            <button className="secondary-button" type="button" onClick={() => setMostrarRegistroAdmin((v) => !v)}>
              {mostrarRegistroAdmin ? 'Cancelar alta' : '+ Nuevo administrador'}
            </button>
            <button className="secondary-button" type="button" onClick={cerrarSesion}>Cerrar sesión</button>
          </div>
        </header>

        <section className="welcome-card">
          <div>
            <span className="welcome-label">PANEL DE ADMINISTRACIÓN</span>
            <h2>¡Bienvenida a CitaMed!</h2>
            <p>Mantén organizada la información de los pacientes desde un solo lugar.</p>
          </div>
          <div className="welcome-symbol" aria-hidden="true">✚</div>
        </section>

        {mostrarRegistroAdmin && (
          <form className="patient-form admin-form" onSubmit={registrarAdministrador}>
            <h3>Registrar nuevo administrador</h3>
            <p>Solo una sesión administrativa activa puede crear otra cuenta de administrador.</p>
            <div className="form-grid">
              <label>Nombre de usuario
                <input value={nuevoAdmin.usuario} onChange={(e) => setNuevoAdmin((v) => ({ ...v, usuario: e.target.value }))} required maxLength={100} autoComplete="off" />
              </label>
              <label>Contraseña
                <input type="password" value={nuevoAdmin.contrasena} onChange={(e) => setNuevoAdmin((v) => ({ ...v, contrasena: e.target.value }))} required minLength={8} autoComplete="new-password" />
              </label>
            </div>
            <div className="form-actions">
              <button className="secondary-button" type="button" onClick={() => setMostrarRegistroAdmin(false)}>Cancelar</button>
              <button className="primary-button" type="submit">Crear administrador</button>
            </div>
          </form>
        )}

        <section className="stats-grid">
          <article className="stat-card"><span className="stat-icon blue">♙</span><span className="stat-label">Total de pacientes</span><strong>{pacientes.length}</strong><small>Pacientes registrados</small></article>
          <article className="stat-card"><span className="stat-icon green">✓</span><span className="stat-label">Estado del proyecto</span><strong>Activo</strong><small>Sesión autenticada</small></article>
          <article className="stat-card"><span className="stat-icon purple">▦</span><span className="stat-label">Módulo actual</span><strong>Pacientes</strong><small>Registro y administración</small></article>
        </section>

        <section className="content-card">
          <div className="section-heading">
            <div><h2>Listado de pacientes</h2><p>Consulta y administra los pacientes registrados en el sistema.</p></div>
            <button className="primary-button" type="button" onClick={abrirNuevoPaciente}>+ Nuevo paciente</button>
          </div>
          {mensaje && <div className="message" role="status">{mensaje}</div>}
          {mostrarFormulario && (
            <form className="patient-form" onSubmit={guardarPaciente}>
              <h3>{pacienteEditando !== null ? 'Editar paciente' : 'Registrar paciente'}</h3>
              <div className="form-grid">
                <label>Nombre<input name="nombre" value={formulario.nombre} onChange={actualizarCampo} required maxLength={80} /></label>
                <label>Apellido<input name="apellido" value={formulario.apellido} onChange={actualizarCampo} required maxLength={80} /></label>
                <label>Documento<input name="documento" value={formulario.documento} onChange={actualizarCampo} required maxLength={30} /></label>
                <label>Teléfono<input name="telefono" value={formulario.telefono} onChange={actualizarCampo} required maxLength={30} /></label>
                <label>Correo electrónico<input name="correo" type="email" value={formulario.correo} onChange={actualizarCampo} required maxLength={120} /></label>
                <label>Fecha de nacimiento<input name="fechaNacimiento" type="date" value={formulario.fechaNacimiento} onChange={actualizarCampo} required /></label>
              </div>
              <div className="form-actions">
                <button className="secondary-button" type="button" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
                <button className="primary-button" type="submit">Guardar paciente</button>
              </div>
            </form>
          )}
          <div className="table-toolbar">
            <input className="search-input" type="search" placeholder="Buscar por nombre o documento..." value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} aria-label="Buscar pacientes" />
            <span>{pacientesFiltrados.length} registros</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Paciente</th><th>Documento</th><th>Teléfono</th><th>Correo</th><th>Acciones</th></tr></thead>
              <tbody>
                {cargando && <tr><td colSpan={5} className="empty-state">Cargando pacientes...</td></tr>}
                {!cargando && pacientesFiltrados.map((paciente) => (
                  <tr key={paciente.id}>
                    <td><strong>{paciente.nombre} {paciente.apellido}</strong></td>
                    <td>{paciente.documento}</td><td>{paciente.telefono}</td><td>{paciente.correo}</td>
                    <td><div className="form-actions">
                      <button type="button" className="secondary-button" onClick={() => editarPaciente(paciente)}>Editar</button>
                      <button type="button" className="secondary-button" onClick={() => eliminarPaciente(paciente.id)}>Eliminar</button>
                    </div></td>
                  </tr>
                ))}
                {!cargando && pacientesFiltrados.length === 0 && <tr><td colSpan={5} className="empty-state">No se encontraron pacientes.</td></tr>}
              </tbody>
            </table>
          </div>
          <p className="demo-notice">Los pacientes se consultan y guardan en la base de datos MySQL mediante el servidor Spring Boot.</p>
        </section>
        <footer className="page-footer">Sistema de Gestión de Citas Médicas · Proyecto formativo</footer>
      </main>
    </div>
  )
}

export default App
