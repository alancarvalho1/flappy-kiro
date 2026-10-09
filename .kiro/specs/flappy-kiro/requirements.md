# Requirements Document

## Documento de Requisitos Flappy Kiro

## Introduction

Flappy Kiro é um jogo arcade retrô baseado em navegador inspirado no conceito clássico do Flappy Bird. Os jogadores controlam um personagem fantasma navegando através de tubos verdes orientados verticalmente contra um fundo de céu azul. O jogo enfatiza o timing e reflexos rápidos, com pontuação contínua e rastreamento persistente de pontuação máxima. A experiência é aprimorada com efeitos sonoros para pulos e eventos de fim de jogo.

## Glossary

- **Jogador**: A pessoa controlando o jogo
- **Fantasma**: O personagem protagonista controlado pelo Jogador
- **Tubo**: Obstáculo vertical com uma abertura pela qual o Fantasma deve passar
- **Passagem**: A passagem entre as seções superior e inferior dos tubos pela qual o Fantasma deve voar
- **Colisão**: Contato entre o Fantasma e um Tubo ou os limites da área de jogo
- **Pontuação**: O número de Passagens pelo qual o Fantasma passou com sucesso na sessão atual
- **Pontuação Máxima**: A Pontuação máxima alcançada em todas as sessões de jogo, persistida no armazenamento local
- **Game Loop**: O ciclo contínuo de renderização, detecção de entrada, simulação de física e verificação de colisão
- **Gravidade**: A força constante para baixo aplicada ao Fantasma quando não está pulando ativamente
- **Pulo**: Um movimento ascendente acionado pela entrada do Jogador, opondo-se à Gravidade
- **Fim de Jogo**: O estado quando o Fantasma colide com um obstáculo ou limite, terminando a sessão de jogo atual
- **Som de Fim de Jogo**: Feedback de áudio tocado quando uma Colisão resulta em Fim de Jogo
- **Som de Pulo**: Feedback de áudio tocado quando o Jogador aciona um Pulo
- **Fundo de Céu**: O fundo da área de jogo colorido em azul
- **Chão**: O limite inferior da área de jogo (parte inferior da tela)
- **Teto**: O limite superior da área de jogo (parte superior da tela)

## Requirements

### Requisito 1: Inicialização e Exibição do Jogo

**História de Usuário:** Como um Jogador, quero que o jogo inicie imediatamente quando carrego a página, para que eu possa começar a jogar direto.

#### Critérios de Aceitação

1. QUANDO a página carrega, O Jogo SHALL exibir o estado inicial do jogo com o Fantasma posicionado na área centro-esquerda da área de jogo
2. O Jogo SHALL renderizar um Fundo de Céu azul cobrindo toda a área de jogo
3. O Jogo SHALL renderizar Tubos Verdes se aproximando do lado direito da tela com uma Passagem visível entre as seções superior e inferior dos tubos
4. O Jogo SHALL exibir a Pontuação atual no formato "Score: X" na parte inferior da tela
5. O Jogo SHALL exibir a Pontuação Máxima no formato "High: Y" na parte inferior da tela, adjacente à Pontuação atual
6. O Jogo SHALL inicializar a Pontuação para 0 quando uma nova sessão de jogo começa

### Requisito 2: Controle e Movimento do Fantasma

**História de Usuário:** Como um Jogador, quero controlar o Fantasma com entrada simples, para que eu possa navegá-lo pelos Tubos.

#### Critérios de Aceitação

1. QUANDO o Jogador pressiona a tecla Espaço, O Fantasma SHALL se mover imediatamente para cima em oposição à Gravidade
2. QUANDO a ação de Pulo é acionada, O Som de Pulo SHALL ser tocado
3. ENQUANTO nenhuma ação de Pulo está ativa, O Fantasma SHALL cair continuamente para baixo devido à Gravidade
4. A velocidade ascendente do Fantasma de um Pulo SHALL ser suficiente para alcançar o terço superior da área de jogo dentro de 0,5 segundos
5. A aceleração descendente do Fantasma devido à Gravidade SHALL ser proporcional e consistente durante o jogo
6. QUANDO o Fantasma atinge o Teto, O Fantasma SHALL não viajar além do limite superior da área de jogo

### Requisito 3: Geração e Movimento de Tubos

**História de Usuário:** Como um Jogador, quero que Tubos apareçam continuamente, para que o jogo proporcione um desafio infinito.

#### Critérios de Aceitação

1. QUANDO um Tubo sai do lado esquerdo da área de jogo, O Jogo SHALL gerar um novo Tubo entrando pelo lado direito da área de jogo
2. A velocidade de movimento do Tubo SHALL ser constante durante uma sessão de jogo
3. A Passagem entre as seções superior e inferior dos tubos SHALL ter um tamanho consistente e mensurável (proporcional ao tamanho do Fantasma)
4. A posição vertical da Passagem SHALL variar aleatoriamente dentro dos limites da área de jogo, excluindo posições onde o Fantasma não pode passar com segurança
5. A distância entre Tubos consecutivos SHALL ser consistente e medida da borda direita de um Tubo para a borda esquerda do próximo Tubo

### Requisito 4: Detecção de Colisão e Fim de Jogo

**História de Usuário:** Como um Jogador, quero que o jogo termine imediatamente ao colidir, para que eu entenda quando falhei.

#### Critérios de Aceitação

1. SE o Fantasma tocar um Tubo, ENTÃO O Jogo SHALL entrar em estado de Fim de Jogo
2. SE o Fantasma tocar o Chão, ENTÃO O Jogo SHALL entrar em estado de Fim de Jogo
3. QUANDO o Jogo entra em estado de Fim de Jogo, O Game Loop SHALL parar e nenhum movimento adicional SHALL ocorrer
4. QUANDO o Jogo entra em estado de Fim de Jogo, O Som de Fim de Jogo SHALL ser tocado
5. QUANDO o estado de Fim de Jogo está ativo, O Jogo SHALL exibir um prompt de reinício ou botão visível para o Jogador

### Requisito 5: Gerenciamento de Pontuação

**História de Usuário:** Como um Jogador, quero que meu progresso seja rastreado, para que eu possa ver quão bem estou indo.

#### Critérios de Aceitação

1. QUANDO o Fantasma passa com sucesso através de uma Passagem, A Pontuação SHALL ser incrementada por 1
2. O Fantasma SHALL ser considerado como tendo "passado com sucesso" quando seu centro cruza o ponto central horizontal de uma Passagem
3. QUANDO o Fantasma passa através da mesma Passagem, A Pontuação SHALL ser incrementada apenas uma vez para essa Passagem
4. QUANDO a Pontuação é incrementada, A exibição de Pontuação na parte inferior da tela SHALL ser atualizada imediatamente
5. A Pontuação SHALL ser redefinida para 0 quando uma nova sessão de jogo começa após Fim de Jogo

### Requisito 6: Persistência de Pontuação Máxima

**História de Usuário:** Como um Jogador, quero que minha melhor pontuação seja salva, para que eu possa rastrear meu progresso ao longo de múltiplas sessões.

#### Critérios de Aceitação

1. QUANDO uma sessão de jogo termina e a Pontuação final é maior que a Pontuação Máxima armazenada, A Pontuação Máxima SHALL ser atualizada para a Pontuação final
2. A Pontuação Máxima SHALL ser persistida no armazenamento local do Navegador usando a chave "flappyKiroHighScore"
3. QUANDO a página carrega, A Pontuação Máxima SHALL ser recuperada do armazenamento local e exibida
4. SE nenhuma Pontuação Máxima existe no armazenamento local, A Pontuação Máxima SHALL ser inicializada para 0
5. QUANDO a Pontuação Máxima é atualizada, A exibição de Pontuação Máxima na parte inferior da tela SHALL ser atualizada imediatamente

### Requisito 7: Efeitos Sonoros

**História de Usuário:** Como um Jogador, quero feedback de áudio para minhas ações, para que eu receba confirmação sensorial de eventos de jogo.

#### Critérios de Aceitação

1. QUANDO o Jogador aciona uma ação de Pulo, O arquivo de áudio "assets/jump.wav" SHALL ser tocado
2. QUANDO o Jogo entra em estado de Fim de Jogo, O arquivo de áudio "assets/game_over.wav" SHALL ser tocado
3. SE o arquivo de áudio não puder ser carregado, O Jogo SHALL continuar funcionando sem som e não exibir erros para o Jogador
4. O Som de Pulo SHALL ser concluído antes que outro Som de Pulo seja tocado, ou múltiplos Sons de Pulo simultâneos são permitidos e misturados
5. O Som de Fim de Jogo SHALL ser tocado exatamente uma vez por estado de Fim de Jogo, mesmo que múltiplos eventos de Colisão ocorram simultaneamente

### Requisito 8: Reinício de Jogo

**História de Usuário:** Como um Jogador, quero reiniciar rapidamente o jogo após falhar, para que eu possa jogar novamente sem recarregar a página.

#### Critérios de Aceitação

1. QUANDO o estado de Fim de Jogo está ativo e o Jogador pressiona a tecla Espaço, O Jogo SHALL redefinir para o estado inicial
2. QUANDO o estado de Fim de Jogo está ativo e o Jogador pressiona a tecla Espaço, A Pontuação SHALL ser redefinida para 0
3. QUANDO o estado de Fim de Jogo está ativo e o Jogador pressiona a tecla Espaço, O Fantasma SHALL retornar à posição inicial centro-esquerda
4. QUANDO o estado de Fim de Jogo está ativo e o Jogador pressiona a tecla Espaço, O Game Loop SHALL ser retomado
5. A Pontuação Máxima SHALL não ser modificada ao reiniciar o jogo

### Requisito 9: Aparência Visual - Fantasma

**História de Usuário:** Como um Jogador, quero que o personagem Fantasma seja visualmente distinto e reconhecível, para que eu possa identificar facilmente meu avatar.

#### Critérios de Aceitação

1. O personagem Fantasma SHALL ser renderizado usando o arquivo de imagem "assets/ghosty.png"
2. O Fantasma SHALL permanecer visível o tempo todo durante o jogo, incluindo quando está no Teto, Chão ou perto das bordas da tela
3. O tamanho visual do Fantasma SHALL ser proporcional ao tamanho da Passagem, permitindo passagem segura quando posicionado corretamente
4. A posição de renderização do Fantasma SHALL corresponder à sua posição de física simulada o tempo todo

### Requisito 10: Aparência Visual - Tubos e Fundo

**História de Usuário:** Como um Jogador, quero um ambiente de jogo visualmente coerente, para que a experiência de jogo seja imersiva e clara.

#### Critérios de Aceitação

1. O Fundo de Céu SHALL ser renderizado em cor azul cobrindo toda a área de jogo
2. Os Tubos SHALL ser renderizados em cor verde
3. QUANDO os Tubos se movem pela tela, A ordem de renderização SHALL garantir que os Tubos apareçam atrás do Fantasma para que o Fantasma sempre esteja visível
4. O Jogo SHALL renderizar Tubos suavemente pela tela sem descontinuidades visuais ou cintilação
5. O estilo visual geral SHALL corresponder à estética retrô arcade mostrada na imagem da UI de referência

### Requisito 11: Consistência da Simulação de Física

**História de Usuário:** Como um Jogador, quero física consistente e previsível, para que eu possa desenvolver habilidade e timing.

#### Critérios de Aceitação

1. A mudança de velocidade vertical do Fantasma por quadro devido à Gravidade SHALL ser matematicamente consistente e independente das variações de taxa de quadro
2. A mudança de velocidade vertical do Fantasma por quadro devido ao Pulo SHALL ser matematicamente consistente e independente das variações de taxa de quadro
3. ENQUANTO o Game Loop está em execução, atualizações de física SHALL ocorrer a uma taxa consistente, dimensionada para manter consistência independentemente da taxa de quadro real
4. A velocidade descendente máxima do Fantasma (velocidade terminal) SHALL ser limitada a um valor que permita aos Jogadores controlar sua descida

### Requisito 12: Tratamento de Entrada Responsiva

**História de Usuário:** Como um Jogador, quero que minha entrada responda imediatamente, para que eu sinta que estou no controle do Fantasma.

#### Critérios de Aceitação

1. QUANDO o Jogador pressiona a tecla Espaço, A ação de Pulo SHALL ser processada dentro de 16 milissegundos (1 quadro a 60 FPS)
2. QUANDO o Jogador pressiona a tecla Espaço enquanto já está em um pulo, A entrada de Pulo subsequente SHALL ser registrada mas processada apenas após o estado de Pulo atual ser resolvido
3. O Jogo SHALL processar múltiplas pressões rápidas da tecla Espaço com elegância sem pular ou atrasarando entrada

## Parsers and Serializers

### Serialização de Pontuação Máxima

**História de Usuário:** Como o Jogo, quero salvar e carregar a Pontuação Máxima, para que o progresso persista entre sessões do navegador.

#### Critérios de Aceitação

1. O Jogo SHALL serializar a Pontuação Máxima como um valor inteiro JSON ao armazenar no armazenamento local
2. AO recuperar a Pontuação Máxima do armazenamento local, O Jogo SHALL analisar o inteiro JSON e validar que é um número não-negativo
3. SE o valor armazenado for inválido ou corrompido, O Jogo SHALL redefinir Pontuação Máxima para 0
4. PARA TODOS os valores de Pontuação Máxima entre 0 e 1.000.000, serializar para armazenamento local e depois desserializar SHALL produzir o mesmo valor inteiro (propriedade de viagem redonda)
