# 💰 Finance Dashboard — Cloud Project

Dashboard financeiro pessoal desenvolvido com **HTML, CSS e JavaScript**, containerizado com **Docker** e preparado para deploy em ambiente **Cloud (AWS)**.

Este projeto demonstra um fluxo completo moderno de desenvolvimento:

> **Desenvolvimento → Versionamento → Containerização → Deploy → Acesso Web**

## 🧭 Arquitetura e Fluxo de Deploy

![Deployment Workflow](assets/images/deployment-flow.png)
---

## 🚀 Live Demo

👉 **Acesse o dashboard online:**
https://rayanne071109-ship-it.github.io/finace_dashboard_layout1/

---

## 📸 Preview

*(adicione aqui depois um print do dashboard)*

```
assets/images/dashboard-preview.png
```

---

## 🎯 Objetivo do Projeto

Este projeto foi criado para praticar e demonstrar conhecimentos em:

* Desenvolvimento Frontend
* Estruturação de projetos web
* Versionamento com Git e GitHub
* Containerização com Docker
* Deploy em ambiente Cloud
* Simulação de ambiente de produção usando Nginx

---

## 🧱 Arquitetura

```
Usuário (Browser)
        ↓
Servidor Web (Nginx)
        ↓
Container Docker
        ↓
HTML + CSS + JavaScript
```

---

## ⚙️ Tecnologias Utilizadas

* HTML5
* CSS3
* JavaScript (Vanilla JS)
* Docker
* Nginx
* Git & GitHub
* AWS EC2 (deploy cloud)

---

## 📁 Estrutura do Projeto

```
finance_dashboard_layout/
│
├── index.html
├── Dockerfile
├── .gitignore
│
└── assets/
    ├── css/
    │   └── style.css
    └── js/
        ├── app.js
        ├── app-v2.js
        └── financeData.js
```

---

## 🐳 Executar com Docker (Recomendado)

### 1️⃣ Build da imagem

```bash
docker build -t finance-dashboard .
```

### 2️⃣ Executar container

```bash
docker run -d -p 80:80 finance-dashboard
```

### 3️⃣ Acessar no navegador

```
http://localhost
```

---

## 💻 Executar Localmente (sem Docker)

```bash
python3 -m http.server 8080
```

Abrir:

```
http://localhost:8080
```

---

## ☁️ Deploy Cloud (AWS)

Fluxo utilizado:

```
GitHub
   ↓
AWS EC2 (Ubuntu)
   ↓
Docker Container
   ↓
Nginx
   ↓
Dashboard Público
```

Principais etapas:

1. Criar instância EC2
2. Instalar Docker
3. Clonar repositório
4. Build da imagem Docker
5. Executar container
6. Liberar porta HTTP (80)

---

## 📊 Funcionalidades

* Visualização de dados financeiros
* Interface responsiva
* Manipulação dinâmica via JavaScript
* Organização modular de scripts
* Layout adaptado para dashboard

---

## 🔄 Workflow de Atualização

Sempre que houver alteração:

```bash
git add .
git commit -m "update dashboard"
git push
```

O projeto permanece versionado e pronto para novo deploy.

---

## 📚 Aprendizados Demonstrados

* Estruturação de aplicações frontend
* Conceitos de servidores web
* Containers Docker
* Deploy em cloud pública
* Fluxo DevOps básico
* Publicação de aplicações web

---

## 👩‍💻 Autora

**Rayanne Fernandes**

Projeto desenvolvido como prática de Cloud Computing, Docker e Deploy Web.

---

## 📄 Licença

Este projeto é destinado para fins educacionais e demonstração de portfólio.
