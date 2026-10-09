# Implementation Plan: Flappy Kiro

## Overview

Este plano detalha a implementação do Flappy Kiro como um jogo arcade retro em HTML5 Canvas com JavaScript vanilla. As tarefas estão organizadas em fases progressivas, começando com a estrutura base do projeto, seguindo pela implementação de componentes principais, e terminando com testes integrados e refinamentos opcionais.

**Abordagem:**
- Implementação incremental com validação em checkpoints
- Testes unitários para componentes críticos
- Testes de integração para fluxos completos
- Tarefas opcionais marcadas com `*` para melhorias pós-MVP

## Tasks

### Fase 1: Setup Inicial e Estrutura do Projeto

- [x] 1. Configurar estrutura do projeto e arquivos base
  - Criar arquivo HTML principal (`index.html`) com canvas
  - Configurar dimensões do canvas (800x600px)
  - Criar arquivo JavaScript principal (`game.js`)
  - Verificar que assets (ghosty.png, jump.wav, game_over.wav) existem no diretório `assets/`
  - _Requisitos: 1.1, 7.1, 9.1_

- [x] 2. Criar classe base GameObject
  - Implementar classe `GameObject` com propriedades x, y, width, height
  - Implementar método `getBounds()` que retorna objeto AABB
  - Implementar métodos vazios `update(deltaTime)` e `render(ctx)` para sobrescrita
  - _Requisitos: Arquitetura de componentes_

- [x] 3. Criar classe GameEngine base
  - Implementar classe `GameEngine` com inicialização de canvas
  - Adicionar propriedades: state (INITIAL/PLAYING/GAME_OVER), score, highScore
  - Implementar método `init()` para inicializar estado do jogo
  - Adicionar constantes de física (gravity, jumpPower, terminalVelocity, pipeSpeed)
  - _Requisitos: 1.1, 11.1, 11.2_

### Fase 2: Implementação da Física e do Ghost

- [x] 4. Implementar classe Ghost
  - Criar classe `Ghost` estendendo `GameObject`
  - Adicionar propriedades: velocityY, gravity, jumpPower, terminalVelocity, image
  - Implementar método `update(deltaTime)` com aplicação de gravidade
  - Implementar cálculo de velocidade terminal
  - Implementar método `jump()` que define velocityY negativo
  - _Requisitos: 2.3, 2.4, 11.1, 11.2_

- [x] 5. Implementar movimento vertical do Ghost com limite de teto
  - Adicionar método `clampToBounds(minY, maxY)` na classe Ghost
  - Prevenir movimento além do teto (top boundary)
  - Prevenir movimento além do chão (bottom boundary)
  - Anular velocidade quando atingir limites
  - _Requisitos: 2.6, 4.2_

  - [x] 5.1 Escrever testes de física do Ghost
    - Testar aplicação de gravidade com delta times conhecidos
    - Testar definição de velocidade de salto
    - Testar cálculo de velocidade terminal
    - Testar clamping de posição
    - _Requisitos: 11.1, 11.2_

### Fase 3: Renderização Base

- [x] 6. Implementar renderização do Canvas
  - Limpar canvas a cada frame com cor de fundo azul (#87ceeb)
  - Implementar método `render()` na GameEngine
  - Implementar renderização simples de retângulo para Ghost (fallback se imagem não carregar)
  - Implementar renderização de texto de score e high score
  - _Requisitos: 1.2, 1.4, 1.5, 10.1, 10.2_

- [x] 7. Implementar carregamento e renderização de sprite do Ghost
  - Carregar imagem `assets/ghosty.png` de forma assíncrona
  - Armazenar na propriedade `ghost.image`
  - Desenhar sprite quando disponível em `Ghost.render(ctx)`
  - Garantir que sprite não aparece além das bordas da tela
  - _Requisitos: 9.1, 9.2, 9.3, 9.4_

### Fase 4: Sistema de Entrada e Loop de Jogo

- [x] 8. Implementar InputHandler
  - Criar classe `InputHandler` que escuta eventos de teclado
  - Detectar pressionamento da tecla Space
  - Chamar método `jump()` da GameEngine quando Space é pressionado
  - Implementar debouncing para evitar múltiplos disparos rápidos
  - _Requisitos: 2.1, 12.1, 12.2, 12.3_

- [x] 9. Implementar game loop principal
  - Criar função `gameLoop()` usando `requestAnimationFrame`
  - Calcular deltaTime entre frames
  - Chamar `update(deltaTime)` e `render()`
  - Agendar próximo frame recursivamente
  - _Requisitos: 1.1, 11.3_

  - [x] 9.1 Implementar cap de deltaTime máximo
    - Prevenir saltos grandes se a aba perder foco
    - Usar cap de ~100ms para deltaTime
    - _Requisitos: 11.3_

### Fase 5: Implementação de Pipes

- [x] 10. Implementar classe Pipe
  - Criar classe `Pipe` estendendo `GameObject`
  - Adicionar propriedades: gapY, gapHeight, speed, scored, canvasWidth, canvasHeight
  - Implementar método `update(deltaTime)` para movimento horizontal
  - Implementar método `isOffScreen()` que verifica se pipe saiu da tela
  - Implementar método `getGapBounds()`, `getUpperPipeBounds()`, `getLowerPipeBounds()`
  - _Requisitos: 3.1, 3.2, 3.3, 10.2_

- [x] 11. Implementar renderização de Pipes
  - Desenhar seção superior do pipe em verde (#2ecc71)
  - Desenhar seção inferior do pipe em verde
  - Deixar gap visível entre as duas seções
  - _Requisitos: 10.2, 10.4_

- [x] 12. Implementar gerador de Pipes
  - Criar método `generatePipe()` na GameEngine
  - Gerar posição aleatória do gap dentro de limites viáveis
  - Garantir gap na altura (entre 50px do topo e canvas.height - gapHeight - 50px)
  - Adicionar novo pipe ao array de pipes
  - Agendar geração de novo pipe em intervalo (2.5 segundos)
  - _Requisitos: 3.1, 3.4, 3.5_

- [x] 13. Implementar remoção de Pipes
  - Remover pipes que saem da tela no método `update()` da GameEngine
  - Manter array limpo de pipes não utilizados
  - _Requisitos: 3.1_

  - [x] 13.1 Implementar pool de objetos para Pipes (otimização)
    - Reciclar objetos Pipe ao invés de criar novos
    - Melhorar performance em games longos
    - _Requisitos: Performance_

### Fase 6: Detecção de Colisão

- [x] 14. Implementar função AABB de colisão
  - Criar função `aabbCollision(bounds1, bounds2)` na GameEngine
  - Verificar sobreposição usando lógica de separação de eixos
  - Retornar true se há colisão, false caso contrário
  - _Requisitos: 4.1, 4.2, 11.1_

- [x] 15. Implementar detecção de colisão Ghost vs Pipes
  - Verificar colisão do Ghost com seção superior de cada pipe
  - Verificar colisão do Ghost com seção inferior de cada pipe
  - Usar função AABB para testes
  - _Requisitos: 4.1_

- [x] 16. Implementar detecção de colisão Ghost vs Limites
  - Verificar colisão do Ghost com chão (bottom boundary)
  - Verificar colisão do Ghost com teto (top boundary)
  - Comparação direta de posições (não usa AABB)
  - _Requisitos: 4.2_

- [x] 17. Integrar detecção de colisão no game loop
  - Chamar `checkCollisions()` a cada frame
  - Transicionar para estado GAME_OVER se colisão detectada
  - Chamar áudio de game over quando estado muda
  - _Requisitos: 4.1, 4.2, 4.3_

  - [x] 17.1 Escrever testes de colisão
    - Testar AABB com retângulos sobrepostos
    - Testar AABB com retângulos não sobrepostos
    - Testar colisão com teto e chão
    - _Requisitos: 4.1, 4.2_

### Fase 7: Sistema de Pontuação

- [x] 18. Implementar lógica de scoring
  - Criar método `updateScore()` na GameEngine
  - Verificar se Ghost cruzou o centro de cada pipe
  - Comparar posição X do Ghost com posição X do pipe
  - Incrementar score se cruzamento detectado e não foi contabilizado
  - Usar flag `scored` no Pipe para evitar double-counting
  - _Requisitos: 5.1, 5.2, 5.3_

- [x] 19. Implementar atualização de display de score
  - Atualizar texto na renderização quando score muda
  - Exibir formato "Score: X" na tela
  - Exibir formato "High: Y" na tela
  - _Requisitos: 1.4, 1.5, 5.4_

  - [x] 19.1 Escrever testes de pontuação
    - Testar incremento de score ao passar por gap
    - Testar que score não incrementa múltiplas vezes por pipe
    - Testar reset de score em novo jogo
    - _Requisitos: 5.1, 5.3_

### Fase 8: Persistência de High Score

- [x] 20. Implementar carregamento de High Score
  - Criar método `loadHighScore()` na GameEngine
  - Recuperar valor de localStorage com chave "flappyKiroHighScore"
  - Fazer parse de JSON e validar que é número >= 0
  - Retornar 0 se chave não existir ou valor inválido
  - _Requisitos: 6.2, 6.3, 6.4_

- [x] 21. Implementar salvamento de High Score
  - Criar método `saveHighScore(score)` na GameEngine
  - Serializar score como JSON
  - Salvar em localStorage com chave "flappyKiroHighScore"
  - Tratar erros silenciosamente se localStorage indisponível
  - _Requisitos: 6.1, 6.2_

- [x] 22. Integrar persistência de High Score no game over
  - Comparar score final com highScore carregado
  - Atualizar e salvar se score > highScore
  - Atualizar display de high score
  - _Requisitos: 6.1, 6.5_

  - [x] 22.1 Escrever testes de persistência
    - Testar salvamento e carregamento de high score
    - Testar corrupted data recovery
    - Testar round-trip property (save → load == original)
    - _Requisitos: 6.1, 6.2, 6.3, 6.4_

### Fase 9: Sistema de Áudio

- [x] 23. Implementar AudioManager
  - Criar classe `AudioManager`
  - Carregar áudio de `assets/jump.wav` e `assets/game_over.wav`
  - Armazenar em propriedades `jumpAudio` e `gameOverAudio`
  - Implementar flag `audioAvailable` para fallback silencioso
  - _Requisitos: 7.1, 7.3_

- [x] 24. Implementar reprodução de som de salto
  - Criar método `playJumpSound()` na AudioManager
  - Resetar `currentTime` para 0 para permitir saltos rápidos
  - Chamar quando Jump é acionado durante PLAYING
  - Tratar erros silenciosamente
  - _Requisitos: 2.2, 7.1, 7.4_

- [x] 25. Implementar reprodução de som de game over
  - Criar método `playGameOverSound()` na AudioManager
  - Garantir reprodução exata uma vez por transição para GAME_OVER
  - Chamar quando colisão detectada
  - Tratar erros silenciosamente
  - _Requisitos: 4.4, 7.2, 7.5_

  - [x] 25.1 Escrever testes de áudio
    - Testar que arquivos de áudio carregam
    - Testar que playback não lança erros
    - Testar fallback silencioso quando áudio indisponível
    - _Requisitos: 7.1, 7.3_

### Fase 10: Game Over e Reinício

- [x] 26. Implementar transição para Game Over
  - Detectar colisão e transicionar state para GAME_OVER
  - Parar game loop de updates
  - Manter renderização ativa para overlay
  - _Requisitos: 4.3_

- [x] 27. Implementar overlay de Game Over
  - Desenhar retângulo semi-transparente sobre tela
  - Exibir texto "Game Over!"
  - Exibir texto "Press SPACE to restart"
  - Renderizar apenas quando state == GAME_OVER
  - _Requisitos: 4.5_

- [x] 28. Implementar reinício do jogo
  - Criar método `reset()` na GameEngine
  - Comparar e atualizar high score se necessário
  - Chamar `init()` para resetar estado
  - Processar Space durante GAME_OVER para reiniciar
  - _Requisitos: 8.1, 8.2, 8.3, 8.4, 8.5_

### Fase 11: Checkpoint - MVP Completo

- [ ] 29. Checkpoint - Validar MVP Completo
  - Verificar se jogo inicia ao carregar página
  - Testar controle com Space key
  - Testar colisão com pipes e limites
  - Testar incremento de score ao passar por gaps
  - Testar game over e reinício
  - Testar persistência de high score
  - Testar sons de jump e game over
  - Verificar que jogo roda suavemente a 60 FPS
  - Se tudo passar, o MVP está pronto. Caso contrário, identificar e corrigir problemas.

---

### Fase 12: Testes Integrados (Opcionais Pós-MVP)

- [x] 30. Escrever testes de integração do game loop
  - Testar que physics atualiza suavemente ao longo do tempo
  - Testar que pipes geram em intervalos corretos
  - Testar que colisão para o jogo
  - Testar que áudio toca nos tempos corretos
  - Testar que renderização atualiza cada frame
  - _Requisitos: 1.1, 11.3_

- [-] 31. Escrever testes end-to-end
  - Testar fluxo completo: start → jump → pass pipes → score → die → restart
  - Verificar persistência de high score entre reloads
  - Testar múltiplas sessões de jogo
  - _Requisitos: Todos_

---

### Fase 13: Melhorias Pós-MVP (Opcionais)

- [x] 32. Implementar dimensões dinâmicas de canvas
  - Tornar canvas responsivo a diferentes tamanhos de viewport
  - Escalar elementos proporcionalmente
  - Manter aspect ratio do jogo
  - _Requisitos: Design futuro_

- [x] 33. Implementar opções de audio (mute/unmute)
  - Adicionar botão de mute na UI
  - Armazenar preferência em localStorage
  - Respeitar preferência ao carregar página
  - _Requisitos: 7.1_

- [x] 34. Adicionar efeitos visuais
  - Efeito visual de partículas ao saltar
  - Efeito visual ao passar por gap
  - Efeito visual ao colidir
  - _Requisitos: Design futuro_

- [x] 35. Adicionar animações suaves
  - Animação de rotação do Ghost durante salto
  - Animação de movimento do Ghost mais realista
  - Transição suave no overlay de game over
  - _Requisitos: Design futuro_

- [x] 36. Implementar temas visuais alternativos
  - Modo escuro
  - Sprites alternativos
  - Paletas de cores customizáveis
  - _Requisitos: 10.5_

- [ ] 37. Adicionar controle de dificuldade
  - Variação de velocidade de gravidade
  - Variação de velocidade de pipes
  - Variação de tamanho de gaps
  - Modo progressivo com dificuldade crescente
  - _Requisitos: Design futuro_

- [ ] 38. Implementar suporte mobile
  - Detectar touch events ao invés de Space key
  - Otimizar tamanho para mobile
  - Testar em dispositivos reais
  - _Requisitos: Design futuro_

---

## Notes

### Ordem de Execução Recomendada

1. **Fases 1-3**: Estrutura base e renderização (validar visualmente)
2. **Fases 4-5**: Input e pipes (verificar aparência e movimento)
3. **Fase 6**: Colisão (testar interação)
4. **Fase 7**: Scoring (validar contagem de pontos)
5. **Fase 8**: Persistência (testar salvamento)
6. **Fase 9**: Áudio (adicionar feedback sensorial)
7. **Fase 10**: Game over e reinício (jogo completo)
8. **Fase 11**: Checkpoint (validação MVP)
9. **Fases 12-13**: Testes adicionais e melhorias opcionais

### Dependências de Tarefas

- Tarefas 4-5 dependem de 3 (GameEngine base)
- Tarefas 6-7 dependem de 4 (Ghost implementado)
- Tarefas 10-11 dependem de 3 (GameEngine base)
- Tarefas 14-17 dependem de 4, 10 (Ghost e Pipe implementados)
- Tarefas 18-19 dependem de 17 (Colisão funcionando)
- Tarefas 20-22 dependem de 19 (Score funcionando)
- Tarefas 23-25 dependem de 3, 8 (GameEngine e Input)
- Tarefas 26-28 dependem de 17, 22 (Colisão e Score)

### Marcação de Tarefas Opcionais

Tarefas marcadas com `*` são opcionais:
- Testes (5.1, 9.1, 13.1, 17.1, 19.1, 22.1, 25.1, 30, 31)
- Melhorias pós-MVP (32-38)

Essas tarefas podem ser puladas para MVP mais rápido, implementadas depois para refinamento.

### Constantes de Configuração

Ao implementar, usar os seguintes valores:

| Constante | Valor | Propósito |
|-----------|-------|----------|
| Canvas Width | 800px | Largura do jogo |
| Canvas Height | 600px | Altura do jogo |
| Gravity | 600 px/s² | Aceleração gravitacional |
| Jump Power | 300 px/s | Velocidade inicial de salto |
| Terminal Velocity | 400 px/s | Velocidade máxima de queda |
| Pipe Speed | 200 px/s | Velocidade horizontal dos pipes |
| Pipe Spacing | 180px | Distância entre pipes |
| Gap Height | 120px | Altura da abertura do pipe |
| Pipe Interval | 2.5s | Intervalo de geração de pipes |
| Ghost Size | 30x30px | Tamanho do sprite do Ghost |
| Sky Color | #87ceeb | Azul do céu |
| Pipe Color | #2ecc71 | Verde dos pipes |

### Validação em Checkpoints

Após completar cada fase, validar:

- **Fase 1-3**: Canvas aparece com fundo azul, Ghost renderizado
- **Fase 4**: Space key responde com salto visual
- **Fase 5**: Pipes aparecem e movem da direita para esquerda
- **Fase 6**: Colisão para o movimento do Ghost
- **Fase 7**: Score incrementa ao passar por gaps
- **Fase 8**: High score persiste após reload
- **Fase 9**: Sons reproduzem em eventos corretos
- **Fase 10**: Game over mostra overlay, Space reinicia
- **Fase 11**: Jogo completo e funcional

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1", "2", "3"] },
    { "id": 1, "tasks": ["4", "5", "8"] },
    { "id": 2, "tasks": ["5.1", "6", "7", "9", "10"] },
    { "id": 3, "tasks": ["9.1", "11", "12", "13"] },
    { "id": 4, "tasks": ["13.1", "14", "15", "16"] },
    { "id": 5, "tasks": ["17", "18", "19"] },
    { "id": 6, "tasks": ["17.1", "19.1", "20", "21", "23"] },
    { "id": 7, "tasks": ["22", "24", "25"] },
    { "id": 8, "tasks": ["22.1", "25.1", "26", "27"] },
    { "id": 9, "tasks": ["28", "30", "31"] },
    { "id": 10, "tasks": ["32", "33", "34", "35", "36", "37", "38"] }
  ]
}
```

