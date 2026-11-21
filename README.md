# CitaMed — Sistema Web de Gestión Médica

Aplicación web para la gestión de pacientes, desarrollada como proyecto formativo utilizando tecnologías Java, Spring Boot, React y MySQL.

El proyecto integra un frontend moderno con un backend REST y una base de datos relacional, implementando autenticación, autorización y operaciones CRUD para la administración de pacientes.

## Descripción

CitaMed es un sistema web desarrollado con el propósito de facilitar la gestión y consulta de información de pacientes mediante una interfaz intuitiva y una arquitectura separada entre frontend y backend.

El sistema cuenta con autenticación de usuarios, control de acceso por roles y funcionalidades de administración de pacientes, permitiendo registrar, consultar, actualizar y eliminar información.

## Funcionalidades implementadas

### Autenticación y seguridad
- Inicio de sesión de usuarios.
- Gestión de sesiones de autenticación.
- Control de acceso basado en roles.
- Roles `ADMIN` y `USER`.
- Protección de rutas y endpoints.
- Contraseñas almacenadas mediante BCrypt.
- Protección CSRF.
- Configuración CORS para la comunicación entre frontend y backend.

### Gestión de pacientes
- Registro de pacientes.
- Consulta y listado de pacientes.
- Búsqueda por nombre o documento.
- Actualización de información.
- Eliminación de pacientes.
- Validaciones de información.
- Persistencia de datos en MySQL.

### Administración
- Panel principal de administración.
- Registro de usuarios desde el rol administrador.
- Control de permisos para las operaciones protegidas.

## Tecnologías utilizadas

### Backend
- Java 21
- Spring Boot 3.5.6
- Spring Web
- Spring Data JPA
- Spring Security
- Hibernate
- Maven
- MySQL 8
- BCrypt

### Frontend
- React 19
- JavaScript
- Vite 8
- HTML5
- CSS3

### Herramientas de desarrollo
- Visual Studio Code
- NetBeans
- MySQL Workbench
- Git
- GitHub
- PowerShell
- Apache Maven

## Arquitectura

El proyecto utiliza una arquitectura dividida en frontend, backend y base de datos.

```text
┌────────────────────────────┐
│        FRONTEND          │
│       React + Vite       │
│     localhost:5173      │
└─────────────┬────────────┘
              │ HTTP / REST
              ▼
┌────────────────────────────┐
│         BACKEND          │
│    Java + Spring Boot    │
│     localhost:8080       │
│                          │
│ Controllers              │
│ Services                │
│ Repositories            │
│ Security                │
│ Entities                │
└─────────────┬────────────┘
              │ JPA / Hibernate
              ▼
┌────────────────────────────┐
│        DATABASE          │
│          MySQL           │
│        proyecto          │
└────────────────────────────┘
```

### Flujo de funcionamiento

1. El usuario interactúa con la interfaz React.
2. El frontend envía solicitudes HTTP al backend.
3. Spring Boot recibe y procesa las solicitudes.
4. Spring Security verifica la autenticación y los permisos.
5. Los servicios y repositorios gestionan las operaciones.
6. JPA/Hibernate interactúa con MySQL.
7. El backend devuelve la respuesta al frontend.

## Estructura del proyecto

```text
SistemaCitasMedicasWeb/
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/citamedicas/
│   │   │       └── sistemacitasmedicasweb/
│   │   │           ├── config/
│   │   │           ├── controller/
│   │   │           ├── modelo/
│   │   │           ├── repository/
│   │   │           └── servicio/
│   │   ├── resources/
│   │   │   └── application.properties
│   │   └── webapp/
│   │
│   └── test/
│       └── java/
│
├── bd_proyecto.sql
├── pom.xml
├── HELP.md
├── IMPLEMENTACION_SEGURIDAD_GA8.md
├── mvnw
├── mvnw.cmd
└── README.md
```

## Requisitos previos

Para ejecutar el proyecto localmente se requiere:

- Java JDK 21.
- Apache Maven 3.10.0 o compatible.
- MySQL Server 8.x.
- Node.js y npm.
- Git.

## Configuración de la base de datos

### 1. Crear la base de datos

En MySQL Workbench, ejecutar el script:

`bd_proyecto.sql`

El script contiene la estructura de base de datos utilizada por el proyecto.

### 2. Configurar la conexión

Revisar el archivo:

`src/main/resources/application.properties`

Configurar los parámetros de conexión a MySQL según el entorno local:

- URL de conexión.
- Usuario de la base de datos.
- Variable de entorno para la contraseña.

La contraseña de la base de datos no debe publicarse en el repositorio.

## Ejecución del backend

### 1. Clonar el repositorio

```bash
git clone https://github.com/lauraarango14/CitaMed-Sistema-Integrado.git
```

### 2. Ingresar al proyecto

```bash
cd CitaMed-Sistema-Integrado
```

### 3. Compilar y ejecutar pruebas

```bash
mvn clean test
```

### 4. Generar el paquete

```bash
mvn clean package
```

### 5. Ejecutar el backend

```bash
java -jar target/SistemaCitasMedicasWeb-0.0.1-SNAPSHOT.jar
```

El backend se ejecuta en:

`http://localhost:8080`

> Si el archivo JAR generado tiene un nombre diferente, utilizar el nombre que se encuentre dentro de la carpeta `target`.

## Ejecución del frontend

### 1. Ingresar a la carpeta frontend

```bash
cd frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

El frontend estará disponible en:

`http://localhost:5173`

## Pruebas

Se realizaron pruebas de compilación, ejecución, funcionalidad y seguridad.

### Pruebas automatizadas

Ejecutadas mediante Maven:

```bash
mvn test
```

Resultado de la ejecución:

- 10 pruebas ejecutadas.
- 0 fallos.
- 0 errores.
- 0 pruebas omitidas.

### Pruebas funcionales

Se verificaron manualmente las siguientes operaciones:

| Funcionalidad | Resultado |
|---|---|
| Registro de pacientes | Correcto |
| Consulta de pacientes | Correcto |
| Actualización de pacientes | Correcto |
| Eliminación de pacientes | Correcto |
| Persistencia después de recargar | Correcto |
| Autenticación | Verificada |
| Restricción por roles | Verificada |
| Acceso no autenticado | Verificado |

## Seguridad

El proyecto incorpora mecanismos de seguridad mediante Spring Security.

- Autenticación de usuarios.
- Autorización por roles.
- Contraseñas cifradas mediante BCrypt.
- Protección de endpoints.
- Control de sesiones.
- Protección CSRF.
- Configuración CORS.
- Restricción de acceso a funcionalidades administrativas.

Las operaciones administrativas de pacientes se encuentran protegidas según los permisos definidos en el backend.

## Alcance actual

Actualmente se encuentran implementados:

- Autenticación y administración de usuarios.
- Seguridad y control de acceso.
- Módulo CRUD de pacientes.
- Integración entre frontend y backend.
- Persistencia mediante MySQL.

Los módulos de médicos, especialidades, programación de agendas, asignación de citas y notificaciones se encuentran fuera del alcance de la implementación actual.

## Repositorio

GitHub:

https://github.com/lauraarango14/CitaMed-Sistema-Integrado

## Autora

Proyecto formativo desarrollado como parte del proceso de formación en Desarrollo de Software.

**CitaMed — Sistema Web de Gestión Médica**

Desarrollado con Java, Spring Boot, React y MySQL.
# CitaMed — Sistema Web de Gestión Médica

Aplicación web para la gestión de pacientes, desarrollada como proyecto formativo utilizando tecnologías Java, Spring Boot, React y MySQL.

El proyecto integra un frontend moderno con un backend REST y una base de datos relacional, implementando autenticación, autorización y operaciones CRUD para la administración de pacientes.

## Descripción

CitaMed es un sistema web desarrollado con el propósito de facilitar la gestión y consulta de información de pacientes mediante una interfaz intuitiva y una arquitectura separada entre frontend y backend.

El sistema cuenta con autenticación de usuarios, control de acceso por roles y funcionalidades de administración de pacientes, permitiendo registrar, consultar, actualizar y eliminar información.

## Funcionalidades implementadas

### Autenticación y seguridad
- Inicio de sesión de usuarios.
- Gestión de sesiones de autenticación.
- Control de acceso basado en roles.
- Roles `ADMIN` y `USER`.
- Protección de rutas y endpoints.
- Contraseñas almacenadas mediante BCrypt.
- Protección CSRF.
- Configuración CORS para la comunicación entre frontend y backend.

### Gestión de pacientes
- Registro de pacientes.
- Consulta y listado de pacientes.
- Búsqueda por nombre o documento.
- Actualización de información.
- Eliminación de pacientes.
- Validaciones de información.
- Persistencia de datos en MySQL.

### Administración
- Panel principal de administración.
- Registro de usuarios desde el rol administrador.
- Control de permisos para las operaciones protegidas.

## Tecnologías utilizadas

### Backend
- Java 21
- Spring Boot 3.5.6
- Spring Web
- Spring Data JPA
- Spring Security
- Hibernate
- Maven
- MySQL 8
- BCrypt

### Frontend
- React 19
- JavaScript
- Vite 8
- HTML5
- CSS3

### Herramientas de desarrollo
- Visual Studio Code
- NetBeans
- MySQL Workbench
- Git
- GitHub
- PowerShell
- Apache Maven

## Arquitectura

El proyecto utiliza una arquitectura dividida en frontend, backend y base de datos.

```text
┌────────────────────────────┐
│        FRONTEND          │
│       React + Vite       │
│     localhost:5173      │
└─────────────┬────────────┘
              │ HTTP / REST
              ▼
┌────────────────────────────┐
│         BACKEND          │
│    Java + Spring Boot    │
│     localhost:8080       │
│                          │
│ Controllers              │
│ Services                │
│ Repositories            │
│ Security                │
│ Entities                │
└─────────────┬────────────┘
              │ JPA / Hibernate
              ▼
┌────────────────────────────┐
│        DATABASE          │
│          MySQL           │
│        proyecto          │
└────────────────────────────┘
```

### Flujo de funcionamiento

1. El usuario interactúa con la interfaz React.
2. El frontend envía solicitudes HTTP al backend.
3. Spring Boot recibe y procesa las solicitudes.
4. Spring Security verifica la autenticación y los permisos.
5. Los servicios y repositorios gestionan las operaciones.
6. JPA/Hibernate interactúa con MySQL.
7. El backend devuelve la respuesta al frontend.

## Estructura del proyecto

```text
SistemaCitasMedicasWeb/
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/citamedicas/
│   │   │       └── sistemacitasmedicasweb/
│   │   │           ├── config/
│   │   │           ├── controller/
│   │   │           ├── modelo/
│   │   │           ├── repository/
│   │   │           └── servicio/
│   │   ├── resources/
│   │   │   └── application.properties
│   │   └── webapp/
│   │
│   └── test/
│       └── java/
│
├── bd_proyecto.sql
├── pom.xml
├── HELP.md
├── IMPLEMENTACION_SEGURIDAD_GA8.md
├── mvnw
├── mvnw.cmd
└── README.md
```

## Requisitos previos

Para ejecutar el proyecto localmente se requiere:

- Java JDK 21.
- Apache Maven 3.10.0 o compatible.
- MySQL Server 8.x.
- Node.js y npm.
- Git.

## Configuración de la base de datos

### 1. Crear la base de datos

En MySQL Workbench, ejecutar el script:

`bd_proyecto.sql`

El script contiene la estructura de base de datos utilizada por el proyecto.

### 2. Configurar la conexión

Revisar el archivo:

`src/main/resources/application.properties`

Configurar los parámetros de conexión a MySQL según el entorno local:

- URL de conexión.
- Usuario de la base de datos.
- Variable de entorno para la contraseña.

La contraseña de la base de datos no debe publicarse en el repositorio.

## Ejecución del backend

### 1. Clonar el repositorio

```bash
git clone https://github.com/lauraarango14/CitaMed-Sistema-Integrado.git
```

### 2. Ingresar al proyecto

```bash
cd CitaMed-Sistema-Integrado
```

### 3. Compilar y ejecutar pruebas

```bash
mvn clean test
```

### 4. Generar el paquete

```bash
mvn clean package
```

### 5. Ejecutar el backend

```bash
java -jar target/SistemaCitasMedicasWeb-0.0.1-SNAPSHOT.jar
```

El backend se ejecuta en:

`http://localhost:8080`

> Si el archivo JAR generado tiene un nombre diferente, utilizar el nombre que se encuentre dentro de la carpeta `target`.

## Ejecución del frontend

### 1. Ingresar a la carpeta frontend

```bash
cd frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

El frontend estará disponible en:

`http://localhost:5173`

## Pruebas

Se realizaron pruebas de compilación, ejecución, funcionalidad y seguridad.

### Pruebas automatizadas

Ejecutadas mediante Maven:

```bash
mvn test
```

Resultado de la ejecución:

- 10 pruebas ejecutadas.
- 0 fallos.
- 0 errores.
- 0 pruebas omitidas.

### Pruebas funcionales

Se verificaron manualmente las siguientes operaciones:

| Funcionalidad | Resultado |
|---|---|
| Registro de pacientes | Correcto |
| Consulta de pacientes | Correcto |
| Actualización de pacientes | Correcto |
| Eliminación de pacientes | Correcto |
| Persistencia después de recargar | Correcto |
| Autenticación | Verificada |
| Restricción por roles | Verificada |
| Acceso no autenticado | Verificado |

## Seguridad

El proyecto incorpora mecanismos de seguridad mediante Spring Security.

- Autenticación de usuarios.
- Autorización por roles.
- Contraseñas cifradas mediante BCrypt.
- Protección de endpoints.
- Control de sesiones.
- Protección CSRF.
- Configuración CORS.
- Restricción de acceso a funcionalidades administrativas.

Las operaciones administrativas de pacientes se encuentran protegidas según los permisos definidos en el backend.

## Alcance actual

Actualmente se encuentran implementados:

- Autenticación y administración de usuarios.
- Seguridad y control de acceso.
- Módulo CRUD de pacientes.
- Integración entre frontend y backend.
- Persistencia mediante MySQL.

Los módulos de médicos, especialidades, programación de agendas, asignación de citas y notificaciones se encuentran fuera del alcance de la implementación actual.

## Repositorio

GitHub:

https://github.com/lauraarango14/CitaMed-Sistema-Integrado

## Autora

Proyecto formativo desarrollado como parte del proceso de formación en Desarrollo de Software.

**CitaMed — Sistema Web de Gestión Médica**

Desarrollado con Java, Spring Boot, React y MySQL.

## Instalación y ejecución del proyecto

### Requisitos previos

Para ejecutar CitaMed es necesario contar con las siguientes herramientas instaladas:

- Java JDK 21
- Apache Maven 3.10.0 o compatible
- Node.js y npm
- MySQL Server 8.4
- Git

### Configuración de la base de datos

1. Iniciar el servidor MySQL.
2. Crear la base de datos `proyecto`.
3. Ejecutar el script SQL disponible en el archivo `bd_proyecto.sql`.
4. Configurar las credenciales de conexión a la base de datos mediante las variables de entorno requeridas por el backend.

### Ejecución del backend

Desde la raíz del proyecto, ejecutar:

```powershell
& "C:\Tools\apache-maven-3.10.0\bin\mvn.cmd" spring-boot:run
```

El backend estará disponible en:

`http://localhost:8080`

### Ejecución del frontend

Ingresar a la carpeta frontend:

```powershell
cd frontend
npm install
npm run dev
```

El frontend estará disponible en:

`http://localhost:5173`

### Generación del archivo ejecutable

Para compilar el proyecto backend y generar el archivo JAR:

```powershell
& "C:\Tools\apache-maven-3.10.0\bin\mvn.cmd" clean package
```

El archivo compilado se genera en la carpeta `target`.

### Tecnologías utilizadas

- Java 21
- Spring Boot 3.5.6
- Spring Security
- Spring Data JPA
- Hibernate
- MySQL 8.4
- React 19
- Vite
- JavaScript
- Maven
- Git y GitHub

### Funcionalidades implementadas

- Autenticación de usuarios.
- Control de acceso basado en roles.
- Registro de usuarios administradores.
- Gestión de pacientes.
- Registro de pacientes.
- Consulta y listado de pacientes.
- Actualización de información de pacientes.
- Eliminación de pacientes.
- Persistencia de información en MySQL.
- Protección de endpoints del backend.

### Repositorio

Código fuente del proyecto:

https://github.com/lauraarango14/CitaMed-Sistema-Integrado

### Estado del proyecto

Proyecto formativo desarrollado como parte del proceso de formación en Desarrollo de Software. La versión documentada incluye el módulo de autenticación y la gestión de pacientes integrados entre frontend, backend y base de datos.


