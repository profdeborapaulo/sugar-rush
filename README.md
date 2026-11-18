# 🍬 Sugar Rush · profdeborapaulo

Jogo de corrida arcade em 3D no navegador inspirado no universo **Corrida Doce (Sugar Rush)**, com paleta vibrante em tons de rosa, pista elevada sobre um cenário açucarado, kart estilizado da Vanellope personalizado com **`profdeborapaulo`**, sistema de colecionáveis com **Nitro Turbo**, física realista e trilha sonora sintetizada via **Web Audio API**.

---

## ✨ Principais Recursos

- **Cenário Corrida Doce em 3D**: Circuito de chocolate com confeitos coloridos, zebras e guarda-corpos em rosa vibrante, pirulitos gigantes, macarons, castelo de wafer, colinas de glacê algodão-doce e iluminação com partículas brilhantes.
- **Personalização `profdeborapaulo`**: Nome exibido no título do jogo, menus, pórtico de largada/chegada, asfalto da pista, arco aéreo de meio de volta, outdoors laterais, castelo de wafer, máquina de fliperama e nas laterais do kart.
- **Física 3D com Rapier3D**: Simulação de aceleração, frenagem, esterçamento, suspensão/aderência na pista e colisões com os guarda-corpos.
- **Colecionáveis e Sistema de Nitro Turbo**:
  - Esferas/baterias brilhantes espalhadas pela pista que concedem **+50 pontos** e carregam a barra de **NITRO**.
  - Ativação do **Turbo por 3 segundos** (tecla `Espaço` ou botão na tela), com aumento de velocidade, rastro de partículas atrás do kart e ajuste dinâmico de campo de visão (FOV) da câmera.
- **Trilha Sonora e Áudio em Tempo Real (Web Audio API)**:
  - Música arcade energética em loop iniciada com a corrida.
  - Efeitos de motor (marcha lenta, cruzeiro, falhas, derrapagem e vibração de zebra).
  - Botão de ativar/silenciar som (`M`) sincronizado com música e efeitos.
- **HUD Completa & 4 Modos de Câmera**:
  - Cronômetro de **3 voltas** com contagem regressiva estilo F1, melhor volta e pontuação.
  - Velocímetro angular segmentado em `KM/H`, medidor de Nitro e minimapa 3D ao vivo.
  - 4 câmeras (`1` Chase View, `2` Cockpit com visor, `3` Candy Kingdom / Visão geral, `4` Drone View).
  - Controles por toque para dispositivos móveis e modo **Auto-Pilot** (`P`) ao concluir a corrida.

---

## 🎮 Controles

| Tecla / Ação | Função |
| --- | --- |
| `W` | Acelerar |
| `A` / `D` | Virar à esquerda / direita |
| `S` | Frear / Ré |
| `Espaço` (ou botão **TURBO**) | Ativar Nitro Turbo (3 segundos) |
| `1` `2` `3` `4` | Alternar entre as 4 câmeras |
| `M` (ou ícone de som) | Ativar / silenciar áudio e música |
| `Esc` (ou botão **REINICIAR**) | Pausar e escolher **Reiniciar Corrida**, **Parar Jogo** ou **Continuar** |
| `Enter` | Iniciar corrida / correr novamente |
| `P` | Ativar modo Auto-Pilot após a chegada |

> Em telas móveis/touch, os botões direcionais e pedais aparecem automaticamente após iniciar a corrida.

---

## 🏁 Como Iniciar, Parar e Finalizar o Jogo

- **Iniciar a corrida**: Na tela inicial, clique em **START TIME TRIAL** ou pressione **`Enter`** para começar a contagem regressiva de largada.
- **Finalizar a corrida**: O modo contra-relógio tem **3 voltas** (`LAP 1/3` até `3/3`). Ao cruzar a linha de chegada na 3ª volta, o jogo finaliza automaticamente e exibe a tela **`FINISH`** com o tempo total, a melhor volta e a pontuação (`SCORE`).
  - Nessa tela, você pode clicar em **RACE AGAIN** (`Enter`) para correr novamente ou em **AUTO-PILOT** (`P`) para assistir ao kart pilotando sozinho.
- **Parar, pausar ou reiniciar no meio da corrida**:
  - Clique no botão **`REINICIAR`** no canto superior direito (ou pressione **`Esc`**) para pausar o jogo imediatamente e escolher:
    - **REINICIAR CORRIDA** (`R` / `Enter`): zera tudo e recomeça a largada imediatamente.
    - **PARAR JOGO**: encerra a corrida atual, zera o placar/tempo, para a música e volta para a tela inicial.
    - **CONTINUAR** (`Esc`): retoma a corrida de onde parou.
  - Para apenas frear e parar o kart na pista, solte `W` e segure **`S`** (ou **BRAKE** no celular).
  - Para silenciar a música e os efeitos sonoros a qualquer momento, pressione **`M`** ou clique no ícone de som no canto superior direito.

---

## 🛠️ Tecnologias Utilizadas

- **[Three.js](https://threejs.org/)** (`^0.183.2`) — Renderização 3D WebGL, materiais, luzes, céu, partículas e texturas procedurais.
- **[Rapier3D (`@dimforge/rapier3d-compat`)](https://rapier.rs/)** (`^0.19.3`) — Motor de física 3D em WebAssembly.
- **Web Audio API** — Sintetizador procedural para trilha sonora arcade e mixagem dos efeitos sonoros do kart.
- **[Vite](https://vite.dev/)** (`^6.2.0`) — Empacotador e servidor de desenvolvimento.
- **HTML5 / CSS3 / JavaScript (ES Modules)** — Interface HUD responsiva e lógica do jogo.

---

## 📁 Estrutura do Projeto

```text
├── index.html                        # Estrutura HTML, HUD, menus e SVG do velocímetro
├── package.json                      # Dependências e scripts Vite
├── public/
│   └── assets/
│       ├── audio/                    # Amostras de áudio do motor, drift e zebra (.wav)
│       └── data/                     # Dados do traçado da pista e manifesto da cena (.json)
└── src/
    ├── main.js                       # Loop principal, câmeras, HUD, colecionáveis, nitro e estado da corrida
    ├── style.css                     # Estilos da interface, responsividade e tema rosa vibrante
    ├── audio/
    │   └── WebAudioSynth.js          # Música arcade em loop e efeitos de motor/ambiente
    ├── physics/
    │   └── KartPhysicsController.js  # Física do kart e integração com Rapier3D
    └── scene/
        ├── CoasterTrackBuilder.js    # Pista, guarda-corpos, LEDs, arco, pórtico e placas
        ├── DeskDioramaBuilder.js     # Elementos do reino doce (wafer, donuts, macarons, fliperama)
        ├── GoldenHourAtmosphere.js   # Iluminação, neblina e partículas brilhantes
        ├── MicroKartBuilder.js       # Modelo 3D do kart inspirado na Vanellope
        ├── ProceduralTextures.js     # Texturas procedurais e letreiros
        └── RoomEnvironmentBuilder.js # Céu, colinas de glacê e cenário de fundo
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (recomendado v18 ou superior)
- `npm` (incluso no Node.js) ou `bun`

### Passo a passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
   cd SEU-REPOSITORIO
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   O jogo ficará disponível em `http://localhost:3000`.

4. **Gerar build de produção (opcional):**
   ```bash
   npm run build
   npm run preview
   ```

---

## 👤 Autoria

Personalizado para **profdeborapaulo**.
