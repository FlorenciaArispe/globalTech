# 📦 Sistema de Control de Stock e Inventario – Comercio de Tecnología

## 🚀 Cómo levantar el proyecto

El proyecto está completamente **dockerizado** y puede ejecutarse en distintos modos según lo que se necesite levantar en desarrollo.

---

### 🔹 Levantar todo junto en modo desarrollo (con imágenes)

Incluye:
- Backend
- Frontend Admin
- Catálogo Público
- Base de datos

```bash
docker compose --profile dev up -d backend static frontend-dev catalog-dev
```
### 🔹 Levantar solo el catálogo público (DEV)

```bash
docker compose --profile catalog up catalog-dev
```
Disponible en: http://localhost:5173

### 🔹 Levantar solo el frontend de administración (DEV)

```bash
docker compose up -d db backend pgadmin frontend-dev
```

### Base de datos. El sistema utiliza PostgreSQL.
Variables principales:
- POSTGRES_DB=tienda
- POSTGRES_USER=tienda_user
- POSTGRES_PASSWORD=tienda_pass

---

## 📝 Descripción

Este proyecto es un **sistema integral de control de stock e inventario** para un comercio dedicado a la venta de **equipos de tecnología**, principalmente:

- 📱 iPhone  
- 💻 MacBooks  
- 🎧 Accesorios tecnológicos  

El sistema permite llevar un **control real del stock**, diferenciando entre productos **trackeados por unidad** (por ejemplo, por IMEI o número de serie) y productos **no trackeados**, además de registrar **ventas** y **clientes**.

El proyecto está dividido en **tres partes principales**:
- Backend (API y lógica de negocio)
- Frontend de administración
- Catálogo público

Todo el sistema se encuentra **dockerizado**, facilitando su ejecución y despliegue.

---

## 🎯 Objetivos del sistema

- Controlar el stock real de productos:
  - Productos **trackeados** (IMEI / número de serie)
  - Productos **no trackeados** (stock por cantidad)
- Registrar ventas y clientes
- Diferenciar productos:
  - Nuevos sellados
  - Usados (unidades individuales)
- Mostrar al público únicamente productos **disponibles en stock**
- Centralizar toda la lógica de negocio en un único backend

---

## 🧠 Arquitectura

El sistema sigue una arquitectura cliente-servidor, con un backend centralizado y dos frontends que consumen la misma API.


---

## 🔙 Backend – API REST

### Tecnologías
- Java
- Spring Boot
- Spring Security
- JPA / Hibernate
- PostgreSQL
- Docker

### Descripción

El backend es el **núcleo del sistema**, encargado de:

- Modelar el dominio del negocio
- Gestionar el stock real de productos
- Exponer endpoints REST para:
  - Administración
  - Catálogo público
- Manejar autenticación y autorización para la parte administrativa

### Estructura

- **Entities**: modelos del dominio (productos, modelos, variantes, unidades, ventas, clientes, etc.)
- **Repositories**: acceso a datos mediante JPA
- **Services**: lógica de negocio, control de stock y agregaciones
- **Controllers**: endpoints REST públicos y protegidos
- **DTOs**: objetos optimizados para frontend
- **Seguridad**: login y protección de endpoints administrativos

---

## 🧑‍💼 Frontend de Administración

### Tecnologías
- Next.js
- React
- TypeScript
- Chakra UI
- Docker

### Descripción

Frontend destinado al **uso interno del comercio**, desde donde se puede:

- Administrar productos e inventario
- Cargar y editar productos con imágenes
- Gestionar stock trackeado y no trackeado
- Registrar ventas
- Registrar y administrar clientes
- Visualizar el estado real del stock

Este frontend consume **endpoints protegidos** del backend y requiere autenticación.

---

## 🛒 Catálogo Público

### Tecnologías
- Vite
- React
- TypeScript
- Docker

### Descripción

El catálogo público es la parte visible para los clientes finales:

- No requiere autenticación
- Muestra únicamente productos con stock disponible
- Productos ordenados y agrupados correctamente
- Utiliza los mismos DTOs generados por el backend para las tarjetas de producto

No contiene lógica de negocio, solo consume la API y presenta la información.

---

## 🔄 Flujo de datos

- El backend genera DTOs optimizados para:
  - Catálogo general
  - Productos destacados
- Ambos frontends consumen la misma base de datos y lógica
- El detalle completo de un producto se obtiene mediante endpoints específicos

---

## 🐳 Docker

Todo el proyecto está dockerizado, lo que permite:

- Ejecutar el sistema completo de forma consistente
- Simplificar el despliegue
- Facilitar el trabajo en distintos entornos

Incluye contenedores para:
- Backend
- Frontend de administración
- Catálogo público
- Base de datos PostgreSQL

---

## 🚀 Estado del proyecto

Proyecto en desarrollo, con una base sólida orientada a:

- Escalabilidad
- Mantenibilidad
- Separación clara de responsabilidades

---

## ✨ Posibles mejoras futuras

- Reportes de ventas
- Historial de movimientos de stock
- Roles y permisos de usuario
- Optimización SEO del catálogo público
- Integración con medios de pago
