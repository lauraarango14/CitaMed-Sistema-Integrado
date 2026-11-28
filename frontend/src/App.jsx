import { useCallback, useEffect, useState } from 'react'
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
  const [vistaActual, setVistaActual] = useState('inicio')
  const [usuarioActual, setUsuarioActual] = useState(null)
  const esAdmin = usuarioActual?.rol === 'ADMIN'
  const [csrfToken, setCsrfToken] = useState('')
  const [verificandoSesion, setVerificandoSesion] = useState(true)
  const [credenciales, setCredenciales] = useState({ usuario: '', contrasena: '' })
  const [mensajeLogin, setMensajeLogin] = useState('')
  const [cargandoLogin, setCargandoLogin] = useState(false)
  const [mostrarFormularioCita, setMostrarFormularioCita] = useState(false)

  const [pacientes, setPacientes] = useState([])
  const [formulario, setFormulario] = useState(formularioVacio)
  const [pacienteEditando, setPacienteEditando] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const [citas, setCitas] = useState([])
  const [busquedaCita, setBusquedaCita] = useState('')

  const [mostrarRegistroAdmin, setMostrarRegistroAdmin] = useState(false)
  const [nuevoAdmin, setNuevoAdmin] = useState({ usuario: '', contrasena: '' })
  

    const cargarCitas = async () => {
      try {
        const respuesta = await fetch('http://localhost:8080/api/citas', {
          credentials: 'include'
        })

        if (!respuesta.ok) {
          throw new Error('Error al consultar las citas')
        }

        const datos = await respuesta.json()
        setCitas(datos)

      } catch (error) {
        console.error('Error cargando citas:', error)
      }
    }

    const citasFiltradas = citas.filter((cita) => {
    const busqueda = busquedaCita.toLowerCase()

    return (
      cita.paciente?.nombre?.toLowerCase().includes(busqueda) ||
      cita.paciente?.apellido?.toLowerCase().includes(busqueda) ||
      cita.medico?.toLowerCase().includes(busqueda) ||
      cita.especialidad?.toLowerCase().includes(busqueda) ||
      cita.estado?.toLowerCase().includes(busqueda)
    )
  })
  
useEffect(() => {
  if (!usuarioActual) return

  const timer = setTimeout(() => {
    cargarCitas()
  }, 0)

  return () => clearTimeout(timer)
}, [usuarioActual])

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

  const cargarPacientes = useCallback(async () => {
  try {
    const respuesta = await fetch(API_URL, { credentials: 'include' })

    if (respuesta.status === 401 || respuesta.status === 403) {
      setUsuarioActual(null)
      throw new Error('Tu sesión terminó. Inicia sesión nuevamente.')
    }

    if (!respuesta.ok) {
      throw new Error('No se pudieron consultar los pacientes.')
    }

    setPacientes(await respuesta.json())
  } catch (error) {
    setMensaje(error.message || 'No fue posible consultar los pacientes.')
  } finally {
    setCargando(false)
  }
}, [])

useEffect(() => {
  if (!esAdmin) return

  let cancelado = false

  async function consultarPacientes() {
    try {
      const respuesta = await fetch(API_URL, {
        credentials: 'include'
      })

      if (respuesta.status === 401 || respuesta.status === 403) {
        if (!cancelado) setUsuarioActual(null)
        return
      }

      if (!respuesta.ok) {
        throw new Error('No se pudieron consultar los pacientes.')
      }

      const datos = await respuesta.json()

      if (!cancelado) {
        setPacientes(datos)
      }
    } catch (error) {
      if (!cancelado) {
        setMensaje(error.message || 'No fue posible consultar los pacientes.')
      }
    }
  }

  consultarPacientes()

  return () => {
    cancelado = true
  }
}, [esAdmin])

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

      if (!respuesta.ok) {
        throw new Error(datos.error || 'No fue posible iniciar sesión.')
      }

      const sesion = await fetch(`${AUTH_URL}/me`, {
        credentials: 'include'
      })

      if (!sesion.ok) {
        throw new Error('Se validaron las credenciales, pero no se pudo recuperar la sesión.')
      }

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

if (usuarioActual && !esAdmin) {
  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="auth-brand-icon">+</div>

        <p className="auth-eyebrow">GESTIÓN MÉDICA</p>

        <h1>Bienvenido a CitaMed</h1>

        <p className="auth-description">
          Tu sesión se encuentra activa y autenticada.
        </p>

        <div className="patient-form">
          <h3>Información de tu sesión</h3>

          <p>
            <strong>Usuario:</strong> {usuarioActual.usuario}
          </p>

          <p>
            <strong>Rol:</strong> {usuarioActual.rol}
          </p>

          <p>
            <strong>Estado:</strong> Sesión activa
          </p>
        </div>

        <button
          className="primary-button auth-submit"
          type="button"
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </button>
      </section>
    </main>
  )
}
if (!usuarioActual) {
  return (
    <main className="auth-screen">
      <form className="auth-card" onSubmit={iniciarSesion}>
          <div className="auth-brand-icon">+</div>
          <p className="auth-eyebrow">GESTIÓN MÉDICA</p>
          <h1>Bienvenida a CitaMed</h1>
          <p className="auth-description">Inicia sesión con tus credenciales para acceder al sistema.</p>
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
          <small className="auth-footnote">Acceso seguro al sistema CitaMed.</small>
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
          <button
            type="button"
            className={`nav-item ${vistaActual === 'inicio' ? 'active' : ''}`}
            onClick={() => setVistaActual('inicio')}
          >
            <span>⌂</span> Inicio
          </button>

          <button
            type="button"
            className={`nav-item ${vistaActual === 'pacientes' ? 'active' : ''}`}
            onClick={() => setVistaActual('pacientes')}
          >
            <span>♙</span> Pacientes
          </button>

          <button
            type="button"
            className={`nav-item ${vistaActual === 'citas' ? 'active' : ''}`}
            onClick={() => setVistaActual('citas')}
          >
            <span>▦</span> Citas médicas
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="avatar">AD</div>
          <div>
            <strong>{usuarioActual.usuario}</strong>
            <span>{usuarioActual.rol}</span>
          </div>
        </div>
      </aside>

      {vistaActual === 'inicio' && (
        <main className="main-content" id="inicio">
          <header className="topbar">
            <div>
              <span className="breadcrumb">Sistema médico / Inicio</span>
              <h1>Dashboard</h1>
              <p>Resumen general del sistema de gestión médica.</p>
            </div>

            <div className="topbar-actions">
              <div className="topbar-status">
                <span className="status-dot" />
                Sesión protegida
              </div>

              <button
                className="secondary-button"
                type="button"
                onClick={cerrarSesion}
              >
                Cerrar sesión
              </button>
            </div>
          </header>

          <section className="welcome-card">
            <div>
              <span className="welcome-label">PANEL PRINCIPAL</span>
              <h2>¡Bienvenida a CitaMed!</h2>
              <p>
                Administra la información y los procesos de tu sistema
                de gestión de citas médicas desde un solo lugar.
              </p>
            </div>

            <div className="welcome-symbol" aria-hidden="true">
              ✚
            </div>
          </section>

          <section className="stats-grid">
            <article className="stat-card">
              <span className="stat-icon blue">♙</span>
              <span className="stat-label">Pacientes registrados</span>
              <strong>{pacientes.length}</strong>
              <small>Registros almacenados</small>
            </article>

            <article className="stat-card">
              <span className="stat-icon green">✓</span>
              <span className="stat-label">Estado del sistema</span>
              <strong>Activo</strong>
              <small>Sesión autenticada</small>
            </article>

            <article className="stat-card">
              <span className="stat-icon purple">▦</span>
              <span className="stat-label">Módulos disponibles</span>
              <strong>1</strong>
              <small>Gestión de pacientes</small>
            </article>
          </section>

          <section className="content-card dashboard-content">
            <div className="section-heading">
              <div>
                <h2>Accesos rápidos</h2>
                <p>Ingresa rápidamente a los módulos del sistema.</p>
              </div>
            </div>

            <div className="dashboard-shortcuts">
              <button
                type="button"
                className="shortcut-card"
                onClick={() => setVistaActual('pacientes')}
              >
                <span className="shortcut-icon">♙</span>
                <strong>Gestionar pacientes</strong>
                <span>Consultar, registrar, editar y eliminar pacientes.</span>
                <span className="shortcut-link">Ir al módulo →</span>
              </button>

              <article className="shortcut-card shortcut-disabled">
                <span className="shortcut-icon">▦</span>
                <strong>Citas médicas</strong>
                <span>Próximamente: programación y gestión de citas.</span>
                <span className="shortcut-link">Módulo en desarrollo</span>
              </article>
            </div>
          </section>

          <section className="content-card dashboard-info">
            <h2>Información del sistema</h2>

            <div className="system-info-grid">
              <div>
                <span>Aplicación</span>
                <strong>CitaMed</strong>
              </div>

              <div>
                <span>Frontend</span>
                <strong>React</strong>
              </div>

              <div>
                <span>Backend</span>
                <strong>Spring Boot</strong>
              </div>

              <div>
                <span>Base de datos</span>
                <strong>MySQL</strong>
              </div>
            </div>
          </section>

          <footer className="page-footer">
            Sistema de Gestión de Citas Médicas · Proyecto formativo
          </footer>
        </main>
      )}

      {vistaActual === 'citas' && (
        <main className="main-content" id="citas">
          <header className="topbar">
            <div>
              <span className="breadcrumb">Sistema médico / Citas</span>
              <h1>Gestión de citas médicas</h1>
              <p>Programa y consulta las citas médicas de los pacientes.</p>
            </div>

            <div className="topbar-actions">
              <div className="topbar-status">
                <span className="status-dot" />
                Sesión protegida
              </div>

              <button
                className="secondary-button"
                type="button"
                onClick={cerrarSesion}
              >
                Cerrar sesión
              </button>
            </div>
          </header>

          <section className="stats-grid">
            <article className="stat-card">
              <span className="stat-icon blue">▦</span>
              <span className="stat-label">Total de citas</span>
              <strong>0</strong>
              <small>Sin citas registradas</small>
            </article>

            <article className="stat-card">
              <span className="stat-icon green">✓</span>
              <span className="stat-label">Estado</span>
              <strong>Programación</strong>
              <small>Gestión de citas médicas</small>
            </article>

            <article className="stat-card">
              <span className="stat-icon purple">♙</span>
              <span className="stat-label">Pacientes disponibles</span>
              <strong>{pacientes.length}</strong>
              <small>Registrados en el sistema</small>
            </article>
          </section>

          <section className="content-card">
            <div className="section-heading">
              <div>
                <h2>Listado de citas</h2>
                <p>Consulta y administra las citas médicas programadas.</p>
              </div>

              <button
                className="primary-button"
                type="button"
                onClick={() => setMostrarFormularioCita((v) => !v)}
              >
                {mostrarFormularioCita ? 'Cancelar' : '+ Nueva cita'}
              </button>
            </div>

            {mostrarFormularioCita && (
              <form
                className="patient-form"
                onSubmit={async (evento) => {
                  evento.preventDefault()

                  const formulario = evento.target
                  const datosFormulario = new FormData(formulario)

                  const nuevaCita = {
                    paciente: {
                      id: Number(datosFormulario.get('paciente'))
                    },
                    medico: datosFormulario.get('medico'),
                    especialidad: datosFormulario.get('especialidad'),
                    consultorio: datosFormulario.get('consultorio'),
                    fecha: datosFormulario.get('fecha'),
                    hora: datosFormulario.get('hora'),
                    estado: datosFormulario.get('estado'),
                    motivoConsulta: datosFormulario.get('motivoConsulta')
                  }

                  try {
                    const token = await solicitarTokenCsrf()

                    const respuesta = await fetch('http://localhost:8080/api/citas', {
                      method: 'POST',
                      credentials: 'include',
                      headers: {
                        'Content-Type': 'application/json',
                        'X-XSRF-TOKEN': token
                      },
                      body: JSON.stringify(nuevaCita)
                    })

                    if (!respuesta.ok) {
                      const mensaje = await respuesta.text()
                      throw new Error(mensaje || 'Error al guardar la cita')
                    }

                    await cargarCitas()
                    formulario.reset()
                    setMostrarFormularioCita(false)
                    alert('¡Cita guardada correctamente!')

                  } catch (error) {
                    console.error('Error guardando cita:', error)
                    alert(error.message || 'No fue posible guardar la cita.')
                  }
                }}
              >
                <h3>Programar nueva cita</h3>

                <div className="form-grid">
                  <label>Paciente
                    <select name="paciente" required defaultValue="">
                      <option value="" disabled>Seleccionar paciente</option>
                      {pacientes.map((paciente) => (
                        <option key={paciente.id} value={paciente.id}>
                          {paciente.nombre} {paciente.apellido} - {paciente.documento}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>Médico
                    <input name="medico" type="text" placeholder="Nombre del médico" required />
                  </label>

                  <label>Especialidad
                    <input name="especialidad" type="text" placeholder="Ej. Medicina general" required />
                  </label>

                  <label>Consultorio
                    <input name="consultorio" type="text" placeholder="Ej. Consultorio 101" required />
                  </label>

                  <label>Fecha de la cita
                    <input name="fecha" type="date" required />
                  </label>

                  <label>Hora
                    <input name="hora" type="time" required />
                  </label>

                  <label>Estado
                    <select name="estado" defaultValue="Programada" required>
                      <option value="Programada">Programada</option>
                      <option value="Confirmada">Confirmada</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </label>

                  <label>Motivo de consulta
                    <input
                      name="motivoConsulta"
                      type="text"
                      placeholder="Describe brevemente el motivo"
                      required
                    />
                  </label>
                </div>

                <div className="form-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => setMostrarFormularioCita(false)}
                  >
                    Cancelar
                  </button>

                  <button className="primary-button" type="submit">
                    Guardar cita
                  </button>
                </div>
              </form>
            )}

           <div className="table-toolbar">
              <input
                className="search-input"
                type="search"
                placeholder="Buscar citas..."
                aria-label="Buscar citas"
                value={busquedaCita}
                onChange={(evento) => setBusquedaCita(evento.target.value)}
              />

              <span>{citas.length} registros</span>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Médico</th>
                    <th>Especialidad</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                
                <tbody>
                  {citas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="empty-state">
                        No hay citas registradas actualmente.
                        <br />
                        Utiliza el botón <strong>+ Nueva cita</strong> para comenzar.
                      </td>
                    </tr>
                  ) : (
                    citasFiltradas.map((cita) => (
                      <tr key={cita.id}>
                        <td>
                          {cita.paciente?.nombre} {cita.paciente?.apellido}
                        </td>
                        <td>{cita.medico}</td>
                        <td>{cita.especialidad}</td>
                        <td>{cita.fecha}</td>
                        <td>{cita.hora}</td>
                        <td>{cita.estado}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <p className="demo-notice">
              La interfaz de programación de citas está en construcción.
              Próximamente se conectará con el servidor Spring Boot y MySQL.
            </p>
          </section>

          <footer className="page-footer">
            Sistema de Gestión de Citas Médicas · Proyecto formativo
          </footer>
        </main>
      )}

      {vistaActual === 'pacientes' && (
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

          </section>
        <footer className="page-footer">Sistema de Gestión de Citas Médicas · Proyecto formativo</footer>
      </main>
      )}
    </div>
  )
}

export default App
