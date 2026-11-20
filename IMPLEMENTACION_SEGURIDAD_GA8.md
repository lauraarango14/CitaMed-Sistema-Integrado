# CitaMed – Implementación de seguridad para GA8

## Alcance

Esta versión añade autenticación mediante sesión HTTP de Spring Security para el panel administrativo. Conserva el CRUD de pacientes y los registros existentes de la tabla `usuarios`.

- Solo los usuarios con autoridad `ADMIN` pueden acceder al CRUD y a las rutas administrativas.
- El login crea una sesión HTTP persistente mediante `JSESSIONID`.
- Las operaciones POST, PUT y DELETE usan protección CSRF con cookie `XSRF-TOKEN` y header `X-XSRF-TOKEN`.
- CORS permite el origen local `http://localhost:5173` con credenciales.
- El registro de nuevos administradores solo está disponible para un administrador que ya inició sesión. No existe auto-registro público con privilegios administrativos.
- Las contraseñas nuevas se almacenan con BCrypt.

## Compatibilidad con usuarios existentes

La entidad `Usuario` incorpora el campo `rol`. Hibernate lo agrega mediante `spring.jpa.hibernate.ddl-auto=update`; no se elimina ni se recrea la tabla.

Las cuentas anteriores no tienen rol almacenado. Para que puedan seguir autenticándose, `UsuarioDetailsService` interpreta temporalmente un rol nulo como `ADMIN`. Los nuevos usuarios se guardan explícitamente con rol `ADMIN`.

Esto significa que las cuatro cuentas que ya estaban en la tabla se conservan y, mientras su rol permanezca nulo, se consideran administradores. Cuando se defina cuáles deben conservar ese permiso, se puede actualizar el rol de las demás a un rol sin acceso administrativo; no se ha ejecutado ninguna actualización masiva en la base de datos.

## Primer acceso administrativo

Se puede iniciar sesión con cualquiera de las cuentas existentes si se conocen sus credenciales. Si no se conoce ninguna contraseña, se puede crear una cuenta inicial mediante variables de entorno. Elegir un nombre de usuario nuevo que no exista en `usuarios` y una contraseña fuerte de al menos 8 caracteres.

En PowerShell, antes de iniciar Spring Boot:

```powershell
$env:DB_PASSWORD = "TU_CLAVE_MYSQL"
$env:CITAMED_BOOTSTRAP_USERNAME = "admin_citamed"
$env:CITAMED_BOOTSTRAP_PASSWORD = "UNA_CLAVE_FUERTE_DE_12_O_MAS_CARACTERES"
```

Después iniciar el backend desde ese mismo proceso de Windows/NetBeans para que herede las variables. Si NetBeans ya estaba abierto antes de definirlas, cerrarlo y volverlo a abrir desde el entorno que contiene las variables, o configurar esas variables en la configuración de ejecución del proyecto.

El inicializador crea esa cuenta solo si ambas variables están presentes y el usuario todavía no existe. No modifica contraseñas ni reemplaza cuentas existentes. Después del primer arranque se pueden quitar las variables de bootstrap y reiniciar el backend.

`DB_PASSWORD` sigue siendo necesaria para la conexión MySQL como antes.

## Flujo de uso

1. Iniciar MySQL.
2. Iniciar Spring Boot en `http://localhost:8080`.
3. Iniciar React/Vite en `http://localhost:5173`.
4. Abrir el frontend: aparecerá el formulario de acceso.
5. Iniciar sesión con un administrador existente o con la cuenta bootstrap.
6. Desde el panel se puede seleccionar **Nuevo administrador**. Esta operación exige una sesión ADMIN activa.
7. Cerrar sesión para volver al formulario de acceso.

## Endpoints

| Método | Endpoint | Acceso |
|---|---|---|
| GET | `/api/auth/csrf` | Público, prepara token CSRF |
| POST | `/api/auth/login` | Público, inicia sesión |
| GET | `/api/auth/me` | ADMIN autenticado |
| POST | `/api/auth/logout` | ADMIN autenticado |
| POST | `/api/auth/registro` | ADMIN autenticado; crea otro ADMIN |
| GET/POST/PUT/DELETE | `/api/pacientes/**` | ADMIN autenticado |

## Verificaciones manuales para GA8

- Abrir `http://localhost:5173` sin sesión: debe mostrar el login.
- Consultar `http://localhost:8080/api/pacientes` sin sesión: debe responder HTTP 401.
- Iniciar sesión: debe mostrar el panel y consultar los pacientes.
- Crear, editar y eliminar un paciente: debe conservar el comportamiento CRUD y persistir en MySQL.
- Cerrar sesión y volver a consultar `/api/pacientes`: debe responder HTTP 401.
- Intentar registrar un administrador sin sesión: debe responder HTTP 401.
- Registrar un administrador desde el panel autenticado: debe crear el usuario con contraseña BCrypt y rol ADMIN.

## Notas de validación

Esta carpeta se preparó a partir del ZIP recibido. En el entorno de preparación no se pudo ejecutar Maven ni completar `npm ci` por falta de dependencias descargadas/tiempo de instalación. Por eso, antes de reemplazar el proyecto de trabajo, ejecutar `mvn test` en el backend y `npm run build` en `frontend`, corregir cualquier incompatibilidad que reporte el entorno local y realizar las verificaciones manuales anteriores.

No se debe publicar el ZIP con contraseñas reales, archivos `.env`, variables de entorno ni copias de la base de datos.
