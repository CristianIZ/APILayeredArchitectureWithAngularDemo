# API Layered Architecture with Angular Demo

Proyecto que implementa una arquitectura en capas con API backend en .NET y frontend en Angular.

## Prerrequisitos

### Backend
- .NET 8.0 SDK o superior
- SQL Server (opcional, usa base de datos en memoria por defecto)
- Visual Studio 2022 o Visual Studio Code

### Frontend
- Node.js versión 18 o superior
- npm
- Angular CLI

## Instalación

### Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/APILayeredArchitectureWithAngularDemo.git
cd APILayeredArchitectureWithAngularDemo
```

### Configurar Backend
```bash
cd Backend
dotnet restore
dotnet build
```

Para usar SQL Server en lugar de base de datos en memoria:
1. Editar `WebApi/appsettings.json`
2. Configurar `ConnectionStrings:DefaultConnection`
3. Ejecutar el script DBCreate.sql dentro de la carpeta Backend

### Configurar Frontend
```bash
cd FrontEnd
npm install -g @angular/cli
npm install
```

## Ejecución

### Backend
Desde el directorio `Backend/WebApi`:
```bash
dotnet run
```
API disponible en `http://localhost:5130` y `https://localhost:7060`

### Frontend
Desde el directorio `FrontEnd`:
```bash
ng serve
```
Aplicación disponible en `http://localhost:4200`

## Arquitectura

### Backend
Arquitectura en capas con separación de responsabilidades:
- **Common**: Configuraciones y utilidades
- **Domain**: Entidades del dominio
- **DTO**: Objetos de transferencia de datos
- **EFRepository**: Repositorios con Entity Framework
- **Mapper**: Perfiles de AutoMapper
- **Services**: Lógica de negocio
- **WebApi**: Controladores y configuración de la API

### Frontend
Aplicación Angular con componentes modulares:
- **auth**: Autenticación y registro
- **dashboard**: Panel principal
- **layout**: Componentes de diseño
- **profile**: Gestión de perfil
- **tasks**: CRUD de tareas

## Comandos Útiles

### Backend
```bash
dotnet build                              # Compilar
dotnet test                               # Ejecutar tests
dotnet ef migrations add NombreMigracion  # Crear migración
dotnet ef database update                 # Actualizar base de datos
```

### Frontend
```bash
ng serve                                  # Servir en desarrollo
ng build --prod                           # Compilar para producción
ng test                                   # Ejecutar tests
ng generate component nombre-componente   # Generar componente
```

## Características

- API RESTful con arquitectura en capas
- Aplicación Angular con Material Design
- Sistema de autenticación y registro
- Diseño responsive
- Navegación persistente