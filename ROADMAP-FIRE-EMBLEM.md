# Plano de evolução — A Revolta dos Mendigos rumo ao padrão Fire Emblem

Data: 2026-10-16
Status: PROPOSTA DE ARQUITETURA E ROADMAP. Nenhuma funcionalidade deste documento foi implementada pela criação deste arquivo.

## Visão
Transformar o atual RPG de estratégia narrativa com batalhas por turnos em um RPG tático de quadrícula inspirado em Fire Emblem, conservando a identidade política de Shadar-Riverie, as decisões morais da revolta e o núcleo persistente de 42 dias.

**Não confundir fidelidade ao gênero com cópia literal.** Fire Emblem serve como referência de clareza de decisões, movimento em grid, risco, objetivos, identidade das unidades, antecipação de resultados, animação e qualidade de UX. Arte, nomes, música e mecânicas particulares protegidas não devem ser copiadas.

## Auditoria da versão atual (arquivos inspecionados)
- README.md e data.js: 42 confrontos narrados, 6 atos, 8 heróis, missões, ações diárias, projetos, bairros, decisões de Graça/Pacto/Legitimidade/Crueldade e múltiplos finais.
- app.js: estado único salvo em localStorage com v:1, combatentes selecionados até 4, dano calculado por fórmulas e aleatoriedade, cura, guarda, habilidades, intervenções sobrenaturais, inimigos com alvo automático; ausência de movimento, coordenadas de terreno, alcance de ataque e objetivos táticos espaciais.
- phaser-battle.js: Phaser é apresentação e comandos, sem modelo de mapa nem pathfinding, sprites Kenney obtidos remotamente, engine Phaser remota, cena reiniciada após cada interação, HUD duplicado em HTML.
- ROADMAP-PHASER.md: registra iterações v1–v8 e riscos de renderização, cache e QA.

### Defeito concreto para corrigir antes da nova arquitetura
data.js define cada herói no vetor [id,nome,classe,ícone,HP,ATQ,DEF,VEL,habilidade,descrição]. app.js acessa `heroData(...)[9]` como se fosse a chave da habilidade em `battleButtons` e `actionAttack`. O índice correto é 8. Exige corrigir para campo nomeado (ideal), criar testes e avaliar saves/compatibilidade. Auditoria adicional: casos de borda de suporte sobrenatural, fase de alvo e HP=0.

## Princípios
1. Núcleo tático puro, independente de Phaser e DOM, com comandos verificáveis e testes determinísticos.
2. Phaser com tilemaps, câmera, unidades, HUD e animações; render não altera regras.
3. Design mobile-first: tocar, mover, confirmar, cancelar; alcance e previsões legíveis.
4. Save compatível por migração explícita de v1 para v2: manter back-ups e não reescrever o save silenciosamente.
5. Novas mecânicas devem refletir a narrativa: barricadas, civis, canais, coletivos, culto, aristocracia e ajuda sobrenatural.
6. Gameplay primeiro, polimento visual depois, com um vertical slice completo antes de converter 42 capítulos.

## Marcos e critérios de aceite

| Marco | Prioridade | Escopo | Critério de aceite | Situação |
|---|---|---|---|---|
| P0 — Confiabilidade | Crítica | Corrigir índice de habilidade; testes de dano, cura, mortes, boss; sprites locais, Phaser local, tratar cache e HUD redundante | Rodada clássica e Phaser sem regressão em desktop/Android e PWA; testes automáticos básicos | Parcial: índice corrigido no app.js; testes iniciais do novo núcleo adicionados, não executados em CI |
| T1 — Protótipo em grade | Crítica | Grid 10×10 ou 12×10, 32 px, ocupação, terreno, cursor, casas válidas, movimento, A* ou Dijkstra, cancelamento | Coto move-se, respeita obstáculos, movimento e ação permanecem corretos após recarregar | Parcial: laboratório 10×9, BFS, ocupação, obstáculos, ponte, seleção e deslocamento; persistência não implementada |
| T2 — Núcleo Fire Emblem | Crítica | Alcance de armas/feitiços, ação após movimento, contra-ataque, previsão de dano/acerto, fases aliadas/inimigas, IA básica | Uma batalha completa vencível sem bugs e com decisões espaciais relevantes | Protótipo inicial: ataque adjacente, previsão de dano determinística, contra-ataque, turno inimigo; faltam acerto, múltiplas armas, objetivos e QA real |
| T3 — Primeiro capítulo vertical | Alta | Dia 1 redesenhado: mapa Distrito Afogado, evento da primeira espada, objetivo narrativo, tutorial contextual, vitória/derrota, save | 10–15 min de campanha jogável, testada mobile/desktop | Pendente |
| T4 — Profundidade tática | Alta | Terrenos, cobertura, gargalos, alcance inimigo, status, arquétipos de armas e magia, objetivos variados | Três mapas com estratégias distintas, mapa e previsão legíveis | Pendente |
| T5 — Pessoas e consequências | Alta | Habilidades pessoais confiáveis, suporte entre personagens, ferimentos, fadiga, permadeath com opção de dificuldade | Relações e perdas afetam missões e combates; sem softlocks | Pendente |
| T6 — Arte e UX de produção | Alta | Spritesheets locais com quadros validados, animações, VFX/SFX, paleta de Carcaça, seis biomas distritais, HUD responsivo | 30/60fps-alvo conforme dispositivo, feedback claro e acessível | Pendente |
| T7 — Converter a campanha | Alta | Criar 42 configurações de cenário sobre ~8–12 mapas base reutilizáveis, objetivos específicos e encontros autorais | Todos os 42 dias possuem objetivo, posicionamento, inimigos, recompensa, QA | Pendente |
| T8 — Estratégia maior | Média | Bairros como nós de suprimento, logística/apoio, influência moral, escolhas em mapas e finais | Atos e linhas políticas influenciam unidades, recursos e objetivos | Pendente |
| T9 — Release e QA | Crítica | Regressão, testes mobile, PWA offline, import/export, autosave, performance, créditos/licenças | Campanha completa reproduzível sem travas, com instalação e recuperação | Pendente |

### Vertical slice recomendado — dia 1
Mapa ortogonal com 10×10 casas; Coto e um Guarda de Tributo. A luta não é uma troca de danos estática:
- Objetivo primário: proteger as moedas e escapar ou derrotar o cobrador (definir variante no design).
- Objetivo opcional: defender um morador/civil no beco, melhorando legitimidade.
- Cobertura: barricas e portas; poça/canal restringe movimento.
- Coto: ataque adjacente, movimento por turno, defesa, preview de dano e contra-ataque.
- Inimigo: perseguição por alcance, indicação de zona de ameaça.
- Após vitória: continuar o Dia 1 preservando recursos, XP e fatos canônicos.
- Tutorial contextual curto, com botão de cancelamento e opção de acelerar animações.
- Não incluir no primeiro slice: 8 classes completas, clima, 42 mapas, grandes árvores de suporte.

## Nova arquitetura sugerida

```
src/
  core/
    model.js            # tipos/estrutura de BattleState, UnitState, TileMap
    actions.js          # validar MOVE, ATTACK, SKILL, WAIT, END_TURN
    movement.js         # casas alcançáveis, obstáculos, custos de terreno
    combat.js           # previsão + resolução única do dano
    ai.js               # pontuação de alvos e posições
    objectives.js       # vencer, sobreviver, proteger, escapar, capturar
    events.js           # eventos estruturados para animação
    save-migrations.js  # v1 -> v2, backup e validação
  scenes/
    BattleMapScene.js
    BattleUIScene.js
    BattleFXScene.js
    DistrictScene.js
  data/
    units.js
    maps/               # Tiled JSON / mapas em grade
    missions.js
  assets/
    tilesets/
    sprites/
    audio/
tests/
  combat.test.js
  movement.test.js
  saves.test.js
  objectives.test.js
```

Separar dado canônico da partida de estado visual transitório (seleção, animação, câmera). Registrar eventos como {type:'damage',source,target,amount}, não inferir golpes a partir da diferença entre snapshots de HP.

## Mecânicas para a identidade de Carcaça
- **Relevo e condição urbana:** pontes estreitas, água profunda, escombros, barricadas e telhados modificam custo, alcance e defesa.
- **População como agente:** civis são objetivos vivos, não simples decorações; salvar, recrutar e evacuar altera apoio e legitimidade.
- **Suprimentos e desgaste:** comida, armas, ervas e fadiga influenciam missões; não permitir grind trivial.
- **Linhas morais:** Graça, Pacto, Crueldade e Legitimidade oferecem vantagens e consequências estratégicas, sem recompensa automática para atrocidades.
- **8 heróis únicos:** especialidades mecânicas derivadas da história, sem reduzir tudo a ATQ/DEF.
- **Ulorian:** chefe que introduz regras de arena, selo feérico e aliados sobrenaturais; etapa tática construída depois de sistemas estáveis.

## IA e variedade de objetivos
Começar com estados pequenos: patrulhar, defender posição, priorizar civil/alvo estratégico, atacar alvo vulnerável, reposicionar-se para contra-ataque. Em missões posteriores usar capturar passagem, sobreviver N turnos, evacuar civis, destruir documento, interromper ritual e derrotar chefe. A IA deve obedecer às mesmas regras de alcance/ocupação dos jogadores.

## Estratégia de implementação
- **Não migrar os 42 dias diretamente**. Construir primeiro uma única batalha real com grid, objetivo, IA e controles em Phaser.
- Testes com mapas 1×1, 3×3 e 10×10 para limites e casos extremos; comparar resultados com regras históricas quando pertinente.
- Evitar cópia visual literal de Fire Emblem; usar inspiração na experiência tática e assets com licença clara.
- Manter instalação PWA com engine e imagens versionadas localmente antes de anunciar suporte offline.
- Definir modos: clássico/narrativo (mais acessível) e tático (novas regras), ao menos durante migração; decidir permanentemente após playtest.
- Instrumentar erros do Phaser e criar página de diagnóstico para o usuário enviar logs sem expor dados de save.

## Métricas de qualidade
- Primeiro turno explicável em até 30 segundos de tutorial.
- No máximo duas ações para selecionar unidade e ver movimento/alcance no celular.
- Após selecionar alvo, previsão de dano, contra-ataque e risco legível.
- 100% dos mapas podem ser concluídos na dificuldade principal sem personagens obrigatórios que já podem ter morrido.
- 0 regressões na importação/exportação de save v1.
- Nenhuma dependência externa necessária ao jogar em modo avião após instalar.
- 42 episódios testados pelo menos uma vez do início ao fim antes do release completo.

## Decisões abertas a validar com o criador
- Grade ortogonal superior estilo FE clássico ou isometria?
- Missões com 4 unidades ativas (coerente com jogo atual) ou escala gradual até 6–8?
- Morte permanente por padrão, modo casual opcional ou ferimentos graves?
- Mecânica de triângulo de armas reinterpretada ou sistema próprio de classes/terrenos?
- Combates concentrados em 42 dias ou campanha menos rígida de múltiplos mapas por capítulo?

## Fontes de referência
- Nintendo, Fire Emblem Engage e discussões do time sobre grade e triângulo de armas: https://www.nintendo.com/us/whatsnew/ask-the-developer-vol-8-fire-emblem-engage-part-3/
- Phaser tilemap API: https://docs.phaser.io/api-documentation/3.90.0/function/tilemaps
- Phaser + Tiled JSON: https://docs.phaser.io/phaser-editor/scene-editor/game-objects/tilemap-object
- Phaser pathfinding e custo de terreno: https://phaser.io/news/2018/03/pathfinding-and-phaser-3

**Esta documentação não modifica o jogo publicado.** Iniciar implementação somente pelo P0 + T1/T2 com testes.

## Entrega experimental — fundação tática T1/T2 + correção P0 (16/10/2026)

**Status:** código e protótipo publicados na branch `main`. **A batalha principal dos 42 dias NÃO foi substituída.** Protótipo não lê nem modifica o localStorage da campanha. Phaser ainda é carregado via CDN e esta página experimental não está no pré-cache do PWA.

### Mudanças de código
- `app.js`: corrige um defeito verificável em três pontos que liam `heroData(h.id)[9]` ou `d[9]` como chave de habilidade. O array em `data.js` declara a habilidade no índice **8** e a descrição no índice **9**. Essa correção pode mudar o funcionamento de habilidades que antes usavam ramo genérico e requer teste de regressão.
- `tactical-core.js` (novo): núcleo puro, sem Phaser nem DOM, com grade ortogonal **10×9**, água, ponte, obstáculos, ocupação, BFS de movimento com custo uniforme, seleção de Coto, deslocamento limitado, ataque adjacente, previsão de dano, contra-ataque, IA de aproximação e condições de vitória/derrota. Combate determinístico apenas no laboratório.
- `tactical-lab.html` (novo): cena Phaser 3 isolada; casas de movimento destacadas, toque no terreno, personagens/HP, botão Atacar, Encerrar turno e Reiniciar. Link direto: `https://pedromaintenance.github.io/a-revolta-dos-mendigos/tactical-lab.html`.
- `tests/tactics.test.js` (novo): sete testes Node para obstáculos, alcance, movimento único, ataque inválido, contra-ataque, turno inimigo e vitória. Executar com `node tests/tactics.test.js`.

### Limitações desta entrega
1. Sprite gráfico é **placeholder geométrico** para focar mecânicas. Não há spritesheets animadas de produção.
2. Não há tela de confirmação de trajetória, desfazer movimento, alcance de feitiço, acerto probabilístico, níveis, fadiga nem múltiplas unidades.
3. O mapa demonstra o núcleo, mas não integra as variáveis de dano, defesa, economia ou missões da campanha original: **não prometer paridade das regras**.
4. O estado tático é inteiramente volátil: F5 reinicia o laboratório; essa é uma separação intencional até criar migração de saves.
5. Não houve teste visual/navegador nem execução da suíte no ambiente do GitHub Pages. O Pages pode levar algum tempo para atualizar.

### Critérios para aprovar o protótipo e iniciar T3
- [ ] Abrir o laboratório no navegador mobile e desktop sem canvas vazio
- [ ] Selecionar Coto e tocar em casas azuis, verificando impedimento de atravessar água fora da ponte
- [ ] Terminar um turno e observar aproximação/ataque da Guarda
- [ ] Verificar previsão de dano e contra-ataque ao ficar adjacente
- [ ] Vencer ou perder sem tela travar; reiniciar funciona
- [ ] Rodar `node tests/tactics.test.js` e registrar o resultado
- [ ] Corrigir diferenças de interação e acessibilidade antes de vincular a campanha real

**Próxima entrega recomendada:** 1º capítulo tático com mapa autoral, controle de câmera, linha de movimento, dados reais do Coto e do Guarda, painel de confirmação e eventos estruturados. Só depois substituir o fluxo de batalha principal.

## Entrega T2.1 — confronto animado em popup (16/10/2026)

**Pedido:** preservar a lógica de mapa/turnos aprovada e animar os ataques numa janela de evento inspirada no ritmo das cenas de confronto de Fire Emblem.

### Publicado na branch `main`
- `battle-popup.js` (novo): sequência de batalha cinematográfica em uma camada Phaser sobre o mapa — fundo escurecido, dois retratos pixelados provisórios maiores, nomes, barras de PV, avanço e recuo do atacante, risco visual do golpe, tremor, número do dano, contra-ataque e queda/desvanecimento se derrotado.
- Botão **PULAR** permite encerrar a apresentação e aplicar o estado final imediatamente.
- `tactical-lab.html`: ações de ataque do jogador e do Guarda, se causarem dano, chamam o novo popup. Enquanto ocorre a animação, os comandos são bloqueados para evitar ações simultâneas.
- O estado final é resolvido **uma única vez** pelo `RevoltTactics.dispatch()`, antes da animação, e aplicado depois do popup. A animação lê as diferenças de PV e não calcula dano, acerto nem resultados próprios.
- A apresentação usa figuras geométricas provisórias, não sprites proprietários do Fire Emblem; arte e animações sprite-by-sprite finais permanecem no backlog.

### Limites conhecidos
- A primeira versão permite um ataque e um contra-ataque; não oferece spritesheets autorais de vários quadros, ataques à distância ou múltiplas unidades.
- Na fase inimiga, o popup mostra o golpe ocorrido depois de a IA ter escolhido sua movimentação; o mapa aplica a posição final quando a animação termina.
- Não há áudio implementado, nem seleção de estilos cinemáticos, nem velocidade customizável.
- Essa implementação não altera nem lê o save da campanha principal.
- A biblioteca Phaser ainda vem de CDN; laboratório requer rede.

### QA recomendado
- [ ] Mover Coto até adjacência e atacar: abrir popup, verificar perda de PV da Guarda e contra-ataque se sobreviver
- [ ] Terminar turno próximo ao guarda: popup de ataque inimigo e atualização do mapa depois
- [ ] Derrotar a Guarda durante o popup e conferir resultado no mapa
- [ ] Usar **PULAR** para evitar travamento ou dano duplicado
- [ ] Verificar tela estreita, orientação vertical, cliques repetidos e acessibilidade
- [ ] Testar carregamento offline apenas após hospedagem local da engine

**Verificação realizada:** sintaxe JavaScript do popup e do script inline do laboratório analisadas com sucesso; commits confirmados. Teste visual com navegador/Pages ainda pendente.

## Hotfix T2.2 — animação demonstrável sem deslocamento (16/10/2026)

**Relato do jogador:** não conseguiu observar as animações implementadas na T2.1.

**Diagnóstico:** a T2.1 foi integrada exclusivamente em `tactical-lab.html`, não no fluxo das 42 batalhas do jogo principal. No laboratório, a animação só é iniciada após o motor confirmar dano em ataque válido — situação que exige mover Coto até a adjacência ou aguardar a investida inimiga. Isso dificultou encontrar/validar o novo comportamento. **Não foi possível confirmar se há também falha de execução no navegador do jogador.**

### Publicado
- Adicionado botão **▶ Ver animação** no laboratório tático. Ele monta um combate demonstrativo adjacente e utiliza o próprio `RevoltTactics.dispatch()` para calcular dano e contra-ataque, passando os snapshots antes/depois ao popup Phaser. Não modifica o progresso do mapa nem o save da campanha.
- Atualizado o texto da página para identificar claramente o modo de demonstração e diferenciar o laboratório do jogo principal.
- Comandos externos ficam bloqueados enquanto o confronto está aberto; `PULAR` do popup e sua conclusão reabilitam o laboratório.
- Atualizada URL do script de popup para `battle-popup.js?v=2` para diminuir problemas com cache antigo.
- Adicionado ao menu da campanha principal link direto **Laboratório tático · Ver animação** para descobrir a funcionalidade sem confundi-la com a batalha antiga.
- O arquivo `battle-popup.js` ainda é a apresentação cinematográfica da T2.1. Nenhuma mudança nas regras da campanha nem no formato do save.

### Aceitação
- [ ] Abrir `/tactical-lab.html` e tocar **Ver animação** sem interagir com o mapa
- [ ] Popup escurece o mapa, desenha dois combatentes ampliados e apresenta golpe + PV e contra-ataque
- [ ] Botão PULAR retorna ao mapa; o progresso da demonstração não modifica Coto/Guarda do laboratório
- [ ] Ataques normais continuam abrindo o popup em condições válidas
- [ ] Verificar Console em caso de popup ausente ou erro durante a execução

**Verificações locais do código:** script inline da página analisado quanto à sintaxe, integração ao popup confirmada e commits no GitHub executados. **Pendente:** teste visual efetivo no GitHub Pages; não declarar bug resolvido sem retorno visual do usuário.

**Próximo passo após QA:** eventos de combate estruturados (incluindo movimento/turno inimigo), spritesheets animadas locais e popup de confronto na batalha canônica apenas quando houver paridade funcional.

## Entrega T2.3 — cut-in cinematográfico integrado à campanha principal (16/10/2026)

**Motivação:** a experiência de animação estava restrita a `tactical-lab.html` e o jogador solicitou seguir com melhorias que fossem visíveis no jogo real, em vez de somente demonstrações.

### Publicado em `main`
- `index.html` passou a carregar `battle-popup.js?v=3` junto da batalha canônica; `phaser-battle.js?v=9` e `app.js?v=9`.
- `RevoltBattleBridge.snapshot()` expõe `targeting` do combate canônico para identificar o herói autor do ataque sem adivinhar a origem.
- `phaser-battle.js` compara estado anterior/atual após os comandos e, **quando um golpe do jogador reduz os PV de um inimigo e a cena ainda está em batalha**, abre uma janela cinematográfica com atacante/defensor, barras de PV e dano calculado pelo próprio `app.js`. O popup é visual: não calcula nem reaplica dano.
- A animação só apresenta **um golpe sem contra-ataque**, já que o motor principal não resolve contra-ataque imediato após cada golpe como o laboratório; não criar efeitos mecânicos fictícios.
- Bloqueio temporário de comandos pelo canvas e pelos botões HTML enquanto a cena cinematográfica está visível. `refresh()` evita remontar a cena enquanto ela está ocupada.
- `battle-popup.js` teve cobertura do viewport adaptada à altura real do Phaser (460 no laboratório; 560 no combate principal), com camada modal interativa que bloqueia toques no mapa enquanto o popup está ativo.
- O PWA passou para `revolta-cache-v9` e inclui `battle-popup.js` no core. O laboratório também passa a usar `battle-popup.js?v=3`.

### Limitações relevantes
- **Ataques letais finais** que mudam imediatamente de tela via `winBattle()` **não exibem o popup**: a cena Phaser é destruída pelo fluxo canônico. É necessário introduzir uma fila de eventos e transição adiada antes da próxima tela.
- **Turnos inimigos com múltiplos atacantes**, habilidades de cura, bloqueios e habilidades que causam dano múltiplo ainda não têm eventos explícitos/encenação completa. Para habilidades de área, esta primeira versão pode mostrar somente o primeiro inimigo afetado.
- O render final é reconstruído a cada ação; mesmo com popup, esta ainda é uma solução de transição e não uma arquitetura de eventos estruturados.
- Os personagens do cut-in são gráficos geométricos provisórios, não spritesheets animados produzidos para a Carcaça.
- Phaser ainda depende de CDN para inicializar. Continuam pendentes teste real de navegador e confiabilidade offline.

### Roteiro de validação
1. Abrir a campanha principal no Pages com conexão, iniciar dia 1 e entrar na batalha.
2. Selecionar Coto no roster, tocar **Atacar** e selecionar Guarda de Tributo; verificar popup e valor correto do dano.
3. Testar PULAR no popup e confirmar que o inimigo perde PV uma única vez.
4. Continuar a batalha e confirmar funcionamento dos controles HTML e Phaser após a animação.
5. No laboratório tático, usar **Ver animação**, testar contra-ataque e botão PULAR.
6. Verificar efeitos de cache, console e tela estreita do Android.

**QA efetuado:** código enviado ao GitHub e verificação estática de sintaxe em andamento/concluída conforme relatório de release. **Não afirmar validação visual real no Pages.**

### Próximo marco
Criar `BattleEventQueue` com eventos tipados `attack / damage / heal / guard / enemy-turn / defeat`, processar transições letais antes da tela de vitória e renderizar sequências de múltiplos inimigos sem inferir autoria a partir de diferença entre snapshots.

## Entrega T2.4 — fila cinematográfica de eventos reais (16/10/2026)

**Problema da v9:** ataques letais encerravam a cena antes do cut-in; o turno inimigo podia aplicar vários danos num único ciclo de `enemyTurn()`, sem possibilidade de reproduzir cada golpe separadamente. A detecção anterior inferia ações por diferenças entre snapshots de PV e só identificava facilmente golpes do jogador.

### Publicado em `main` (v10)
- `app.js` passa a manter uma **fila transitória `battleVisualEvents`**, fora do save da campanha. `fightDamage()` registra eventos com PV anteriores e posteriores do inimigo e identificação da origem; `enemyTurn()` registra cada golpe recebido por um herói.
- O motor continua sendo a fonte única de cálculo de dano. Os eventos carregam dados já resolvidos, sem lançar dados, alterar PV ou ativar regras na apresentação.
- `phaser-battle.js` expõe `playEvents(events,onDone)` e `canPresent()` para reproduzir os confrontos **sequencialmente**, com um único estado de interface bloqueada `visualBusy`, até o último efeito ou a opção **PULAR**.
- `winBattle()` e `loseGame()` chamam `playPendingBattleFX()` antes de mudar de fase, de forma que ataques letais aguardem a conclusão da apresentação quando o Phaser está pronto. Se a cena/engine não estiverem disponíveis, a campanha prossegue normalmente sem efeitos.
- `battleScreen()` também consome a fila e só reinicia a cena Phaser após o último efeito. Abandonada a detecção principal por snapshots anteriores na camada de apresentação, embora a animação residual de alteração de PV ainda exista no renderer para cenários sem cut-in.
- Versionados `app.js?v=10`, `phaser-battle.js?v=10` e cache PWA `revolta-cache-v10`.

### Limites e cuidado com regressões
- Eventos de **cura, defesa, bloqueio pelo selo feérico, suporte e fadiga** ainda não possuem animação específica.
- Habilidades de dano em área podem gerar vários cut-ins em sequência, um por inimigo afetado; isso é intencional para testar a fila, mas requer animação coletiva na versão de arte final.
- Contra-ataque não é inventado nas batalhas canônicas. O protótipo tático ainda possui contra-ataque porque essa é a regra daquele núcleo.
- A fila é somente em memória: se houver recarregamento de página durante o cut-in, os PV já calculados permanecem no save, mas a animação em andamento não reaparece.
- O Phaser ainda é carregado da CDN; o combate clássico deve continuar acessível quando a engine não carrega.
- Teste de interface em navegador real **não executado** neste marco. Validação com o jogador é obrigatória antes de considerar esse fluxo estável.

### Roteiro de aceitação
1. Dia 1: Coto ataca Guarda e causa dano, cut-in mostra PV uma vez; PULAR retorna ao combate.
2. Dia 1: atacar Guarda no golpe final — o popup deve aparecer **antes** da vitória narrativa.
3. Dia 2/3: encerrar a rodada com dois inimigos e observar **um cut-in por golpe recebido**.
4. Deixar todos os defensores morrerem numa batalha de teste: cut-ins inimigos antes de `gameover`.
5. Ativar habilidade de área (Vega) com vários inimigos: cut-ins sequenciais, sem dano duplicado.
6. Recarregar página após um turno e confirmar que saves v1 permanecem legíveis.
7. Testar PWA Android, ausência de asset remoto e fallbacks.

**Verificação feita:** commits no GitHub e validação estática de sintaxe. **Pendente:** QA visual e funcional completo no Pages.

**Próximo marco:** mover eventos para uma API formal `BattleEventQueue`, incluir animações de cura/guarda/magia, mostrar ao vivo o estado anterior durante cada cut-in e substituir sprites geométricos por spritesheets locais.

## Entrega T2.5 — controles de fila cinematográfica v11 (17/10/2026)

**Objetivo:** corrigir perda de eventos quando o Phaser não está pronto ou ainda reproduz um confronto, e tornar as sequências de golpes mais claras e controláveis.

**Publicação em main:**
- Em `app.js`, `playPendingBattleFX()` só consome eventos depois de `playEvents()` confirmar o início. Se o Phaser estiver indisponível, limpa os eventos pendentes e deixa a campanha seguir normalmente. Se uma cinematográfica ainda estiver ocupada, não consome antecipadamente a fila.
- Em `phaser-battle.js`, `playEvents()` contabiliza a posição de cada evento e a quantidade total, expondo ao popup `sequencePosition`/`sequenceTotal` e `onSkipAll`.
- Em `battle-popup.js`, sequências de vários eventos mostram marcador "GOLPE X / Y", o botão **PRÓXIMO** para adiantar somente o confronto atual e **PULAR TUDO** para terminar a fila restante sem recalcular nem aplicar dano duas vezes.
- Assets/scripts com query `?v=11` e PWA `revolta-cache-v11`; laboratório tático referencia a versão nova do popup.

**Limitações:** fila transitória em memória, popup ainda desenhado com personagens geométricos; não foram implementadas animações de cura/magia nesta entrega. Também não foi executado teste visual de navegador real. Confirmação de sintaxe de JS e disponibilidade dos commits não garante funcionamento integral no Pages.

**Testes de aceite:** 
1. Dia 2/3, aguardar múltiplos ataques inimigos: ver progressão "GOLPE 1 / N", botão PRÓXIMO e PULAR TUDO.
2. Verificar que PV não são reduzidos novamente ao pular.
3. Encerrar uma luta com golpe letal, observando a passagem à tela narrativa após o último evento.
4. Testar controle após o popup e após recarregar a PWA.
5. Sem Phaser, confirmar que a campanha prossegue sem travar.

**Próximo passo:** eventos estruturados de cura e defesa; spritesheets animados locais; QA automatizado de turnos, conclusão de batalha e transição do modal.

## Entrega T2.6 — cura e proteção cinematográficas (17/10/2026)

**Publicação:** branch `main`, release v12. Concluída a implementação estática, pendente validação visual real no Chrome/Android.

### Funcionalidade
- `app.js`: novo registrador `queueBattleSupport(kind,caster,target,hpBefore)`, produz eventos cinematográficos de `heal` e `guard` com nomes, PV antes/depois e autoria.
- Curativo com ervas e técnicas de cura de Marga/Olmo geram eventos somente quando **PV efetivamente aumentam**. Não são criadas curas fictícias quando os PV já estão no máximo.
- Ação `Defender` e habilidade `Baluarte` de Lorena geram eventos de proteção, inclusive para aliados protegidos coletivamente; o motor continua estabelecendo `guard=true`.
- `phaser-battle.js`: propagação de `event.kind` para a fila, mantendo a ordem canônica dos eventos.
- `battle-popup.js`: duas variantes novas na mesma cena cinematográfica: **CURA** (anel verde, símbolo de cura, barra de PV crescente, PV recuperados) e **PROTEÇÃO** (anel azul, escudo, mensagem defensiva). Eventos existentes de ataque e contra-ataque preservados.
- Progressão de fila agora usa a legenda **EVENTO X / Y**, adequada para misturas de golpe, cura e proteção.
- `index.html` carrega scripts `?v=12`, `sw.js` usa `revolta-cache-v12`, laboratório usa `battle-popup.js?v=12`.

### Restrições
- **Ainda não substitui sprites geométricos por spritesheets de produção**.
- O suporte sobrenatural do Dia 42 e a cura que acontece entre dias ainda não são integralmente cinematográficos.
- Recarregar durante o evento preserva o save, mas não a reprodução visual.
- Cenas dependem da disponibilidade do Phaser, ainda externo.
- Não foi executado teste visual real no Pages neste marco. Os scripts foram verificados quanto à sintaxe, mas isso não comprova a experiência final.

### Aceite em Pages
1. Selecionar Coto → Defender: ver cinematográfica azul e retornar com `guard=true`, sem alteração indevida dos PV.
2. Usar Curativo após sofrer dano: animação verde e quantidade de PV consistente.
3. Com Marga ou Olmo recrutados: ativar cura pessoal/em grupo; eventos de cura devem aparecer na sequência correta.
4. Com Lorena: usar Baluarte; proteção para todos os aliados vivos, sem aplicação dupla.
5. Executar um ataque com dano seguido de cura e avançar a fila com PRÓXIMO e PULAR TUDO.
6. Verificar regressões de vitória/derrota, PWA, Android e importação do save v1.

**Próximo foco recomendado:** instrumentar testes de fluxo completo, transição de turnos e eventos de ação; introduzir spritesheets e animações locais por classe após testes em navegador.

## Entrega T2.7 — laboratório de regressão cinematográfica v13 (17/10/2026)

**Objetivo:** a prioridade desta versão é tornar os efeitos da campanha verificáveis sem exigência de percorrer vários dias, e criar cobertura de contratos básicos antes de ampliar o sistema.

### Publicado em `main`
- `tactical-lab.html`: seletor de **prévia cinematográfica** com quatro opções — ataque com contra-ataque, cura, defesa e **sequência mista de quatro eventos**. O usuário pode reproduzir os eventos sem mover Coto; as cenas usam dados fictícios explicitamente para QA e não gravam alterações na campanha nem no laboratório.
- A sequência de QA exercita os mesmos callbacks `onDone` e `onSkipAll` do popup, assim como o marcador de progresso **EVENTO X/Y**, para permitir avaliar `PRÓXIMO` e `PULAR TUDO`.
- `tests/cinematic-contract.test.js`: novos testes Node para sintaxe de scripts, alinhamento entre versões de assets e service worker, existência dos três tipos de evento, encadeamento do popup, demonstrações e regras determinísticas de dano/contra-ataque do laboratório. Execução prevista: `node tests/cinematic-contract.test.js`.
- Versões atualizadas para `?v=13` na campanha, `battle-popup.js?v=13` no laboratório e `revolta-cache-v13` na PWA. Esta entrega não altera as fórmulas de dano, os saves nem a campanha.

### Smoke tests efetivamente executados durante a implementação
O núcleo `tactical-core.js` foi avaliado em JavaScript em cinco verificações: água intransponível/ponte transitável, movimentação sem atravessar bloqueios, impossibilidade de ataque à distância, dano 10 + contra-ataque 6 em unidade adjacente e progressão de turno. **5/5 passaram.** Os testes adicionais de `tests/cinematic-contract.test.js` foram adicionados ao repositório, mas sua execução por Node/CI ainda deve ser confirmada.

### Limitações e QA
- Ainda sem automação de navegador para constatar visualmente os frames, gestos, sprites, travamentos e cache no Pages; não afirmar resolução dos relatos visuais anteriores.
- Prévia demonstrativa usa combatentes provisórios e valores preparados, não o salvamento real.
- Dano e condições da campanha seguem no `app.js`; o laboratório tático usa seu núcleo experimental separado.
- O motor Phaser ainda vem de CDN, portanto o modo cinematográfico não tem garantia offline.
- **Aceite no Pages:** abrir `/tactical-lab.html`, trocar as quatro opções e pressionar **Reproduzir**; avaliar cortes, PV, cores, marcador de evento, próximo e pular tudo, retornando ao mapa com comandos funcionando.
- Em seguida, no jogo principal, testar Defender/Curativo e um ataque letal; verificar que o save permanece intacto.

**Próximo marco recomendado:** executar os testes Node em CI, automatizar testes em navegador, implementar spritesheets originais e só então acrescentar efeitos de magia complexa. O laboratório de QA não deve substituir a validação da campanha real.

## Entrega T2.8 — CI de combate + arma animada (17/10/2026)

**Release publicada:** v14, branch `main`.

### Evolução implementada
- Adicionada `.github/workflows/combat-tests.yml`, com GitHub Actions em alterações relevantes no `main`, pull requests e execução manual. Node.js 22 executa `tests/tactics.test.js` e `tests/cinematic-contract.test.js`; o job falha se alguma asserção falhar. **O workflow foi enviado, mas seu resultado no Actions ainda precisa ser conferido**; commit não significa teste verde.
- `battle-popup.js`: animação de golpe mais legível, com preparação/levantamento da arma, avanço do combatente, rotação de espada e recuperação da pose. Contra-ataque recebe antecipação própria. Dano, PV e regras continuam 100% controlados pelo motor original e não pela animação.
- `index.html` e laboratório tático usam scripts `?v=14`; PWA migra para `revolta-cache-v14`.

### Aceite
1. Verificar na aba [Actions](https://github.com/pedromaintenance/a-revolta-dos-mendigos/actions/workflows/combat-tests.yml) se os jobs de teste terminaram verdes.
2. Abrir [laboratório tático](https://pedromaintenance.github.io/a-revolta-dos-mendigos/tactical-lab.html), escolher ataque + contra-ataque e observar a arma antecipar e desferir o golpe (além do deslocamento do corpo).
3. Reproduzir a sequência mista; PULAR TUDO não altera PV nem trava.
4. Na campanha, testar curativo e golpe letal, conferir salvamento, transição e ausência de golpes duplicados.
5. Reabrir PWA instalada para conferir atualização de cache.

**Limites:** ainda são figuras geométricas, não spritesheets autorais; nenhuma garantia de Phaser offline por depender de CDN. Sintaxe e testes de contrato não substituem teste visual real. O roadmap de Fire Emblem ainda precisa concluir movimento em grade na campanha principal, arte definitiva e cenários.

**Próxima prioridade:** incorporar teste de navegador automatizado e melhorar o estado visual dos ataques, evitando descompasso de PV quando uma sequência longa termina.

## Entrega T2.9 — combatentes pixelados procedurais nos cut-ins (17/10/2026)

**Versão:** v15, publicada na branch `main`.

### Implementado
- `battle-popup.js`: os bonecos geométricos do cut-in foram substituídos por personagens procedurais de pixel-art desenhados em grade rígida de 4 px sobre Phaser Graphics. Os sprites são criados localmente em tempo de execução, sem novas bibliotecas ou URLs de imagens.
- Silhuetas agora têm rosto, cabelos/capacete, túnica, botas, braços, cinto, equipamentos e paletas diferenciadas conforme o papel inferido do nome/ID (Corte, combatentes, cavaleiros/guardas, curandeiros/bardos, conjuradores). A arma agora é um conjunto que gira com o golpe; cajado é usado em classes mágicas/curativas, espada nas demais.
- Mantida a lógica de animação de ataque, dano, contra-ataque, cura e proteção das versões anteriores. Não houve alteração na regra canônica de combate, progresso, XP ou formato de save.
- `tests/cinematic-contract.test.js`: contrato ampliado para garantir existência de paletas de classe, Phaser Graphics local e animação de equipamento.
- `index.html` atualizado para `app.js?v=15`, `phaser-battle.js?v=15`, `battle-popup.js?v=15`; `tactical-lab.html` para popup v15 e PWA para `revolta-cache-v15`.

### Escopo e limitações
- **Não são spritesheets finais:** são personagens pixelados procedurais, com diferenças visuais simples e animações de corpo/arma existentes.
- A identificação visual da classe é heurística por nomes e IDs; uma ficha visual formal será necessária para personalizar os oito heróis e dezenas de inimigos.
- Ainda não há frames autorais de caminhada/ataque por classe nem QA visual automatizado.
- A execução dos testes no GitHub Actions precisa ser consultada na página de workflows; a publicação de commits não é prova de CI verde.
- A batalha da campanha ainda é de turnos clássicos; grid e movimentação permanecem no laboratório tático.

### Verificação recomendada
1. Abrir `/tactical-lab.html`, escolher **Ataque + contra-ataque** e verificar silhueta pixelada de Coto e Guarda, incluindo arma articulada.
2. Alternar entre **Cura**, **Defesa** e **Sequência mista**; conferir contraste, cores, barras de PV e PULAR TUDO.
3. Na campanha, testar pelo menos um ataque, um curativo e uma defesa para confirmar renderização sem travamentos.
4. Verificar [GitHub Actions](https://github.com/pedromaintenance/a-revolta-dos-mendigos/actions/workflows/combat-tests.yml) e executar os testes Node antes de declarar a versão estável.
5. Verificar atualização da versão instalada no celular.

**Próximo marco:** spritesheets próprios por personagem com poses definidas, testes reais de navegador/Android e evolução do grid tático para as batalhas canônicas.

## Entrega T2.10 — golpe final cinematográfico e QA direcionado (17/10/2026)

**Publicação:** v16, branch `main`. Link para teste: https://pedromaintenance.github.io/a-revolta-dos-mendigos/tactical-lab.html

### Implementado
- `battle-popup.js`: diferencia ataques letais de golpes comuns a partir de `hpBefore > 0 && hpAfter <= 0`, sem modificar as regras de combate. Golpes fatais apresentam cabeçalho **GOLPE FINAL**, explosão visual, símbolo de derrota e desaparecimento progressivo do defensor. O tempo da animação foi estendido para que o finalizador seja perceptível.
- `tactical-lab.html`: adicionadas as prévias **Golpe final / derrota** e **Ataque da Corte**. Os cenários de demonstração produzem snapshots sintéticos locais e não leem ou alteram a campanha salva.
- `tests/cinematic-contract.test.js`: contrato ampliado para testar presença das duas prévias e dos gatilhos/efeitos do golpe final.
- `index.html` versionado para scripts `?v=16`, `sw.js` para `revolta-cache-v16` e laboratório para `battle-popup.js?v=16`.
- **Sem mudanças na matemática de dano, IA, XP, loot, missões, formato de save ou estrutura das 42 batalhas.**

### QA e limitações
- Sintaxe JavaScript dos arquivos `app.js`, `sw.js`, `battle-popup.js`, código inline de `tactical-lab.html` e teste de contrato verificada durante a entrega. Consistência do número de versão e presença dos novos cenários também conferidas.
- A execução completa dos testes Node em GitHub Actions **ainda não foi confirmada** nesta interação; o link do workflow é https://github.com/pedromaintenance/a-revolta-dos-mendigos/actions/workflows/combat-tests.yml.
- **Não houve execução de navegador para validar os quadros visuais** no Pages; commits e verificação de sintaxe não equivalem a QA gráfico.
- Ataques em área e eventos de cura continuam utilizando os cut-ins existentes; somente ataques que reduzem PV a zero recebem o finalizador.
- Personagens seguem como pixel art procedural; spritesheets desenhados à mão e integração do grid na campanha continuam pendentes.

### Aceitação no Pages
1. Abrir o laboratório e selecionar **Golpe final / derrota**; verificar o título específico, o impacto e a queda do guarda.
2. Selecionar **Ataque da Corte**; confirmar posição e golpe do guarda contra Coto.
3. Reproduzir a **Sequência mista** e conferir que PRÓXIMO/PULAR TUDO continuam funcionando.
4. Testar no jogo principal um ataque letal e comparar o resultado narrativo depois do cut-in; confirmar que o save não foi afetado.
5. Verificar o resultado real do CI e abrir um bug específico se houver erro em qualquer navegador.

**Próximo passo recomendado:** executar e tornar obrigatórios testes em navegador, formalizar modelos gráficos por personagem e substituir pixel art procedural por spritesheets autorais.

## Entrega T2.11 — identidade visual individual dos oito heróis (17/10/2026)

**Release:** v17, publicada na branch `main` para testes no GitHub Pages.

### Entrega implementada
- `battle-popup.js`: adicionados **perfis visuais explícitos** para Coto, Marga, Íria, Silas, Olmo, Dara, Vega e Lorena, substituindo o reconhecimento exclusivamente genérico por classes. Cada perfil possui cores de roupas/sombras/detalhes/cabelo e armamento próprio. Os perfis permanecem pixel-art procedural feita em código (não spritesheets externas).
- Variações de equipamento: espada, cajado, adaga, martelo, lança e escudo. Silas recebe martelo; Íria, adaga; Dara, lança; Lorena, escudo. Há detalhes de traje específicos para diferentes heróis.
- `tactical-lab.html`: nova prévia **Vitrine dos oito heróis**, que apresenta oito confrontos demonstrativos em sequência para comparar aparências e armas sem avançar a campanha ou alterar saves; continuam disponíveis PRÓXIMO e PULAR TUDO.
- `tests/cinematic-contract.test.js`: acrescentadas asserções de presença dos oito perfis, da vitrine e dos tipos de armamento.
- `index.html` e scripts publicados como `?v=17`; `sw.js` passa a `revolta-cache-v17`.

### QA e limitações
- Fonte única das regras de combate permanece `app.js`; esta entrega não modifica dano, PV, XP, decisões, missões ou formato de save.
- Verificação de sintaxe e contratos estáticos deve acompanhar a versão, mas execução visual real no navegador ainda não foi confirmada.
- As figuras são procedurais, portanto não equivalem a arte final pixel-by-pixel nem às animações específicas com vários quadros.
- A vitrine usa valores sintéticos de PV intencionalmente e não deve ser confundida com a campanha.
- GitHub Actions CI disponível em https://github.com/pedromaintenance/a-revolta-dos-mendigos/actions/workflows/combat-tests.yml; conferir estado do job, sem presumir sucesso.

### Roteiro de aceite
1. Abrir https://pedromaintenance.github.io/a-revolta-dos-mendigos/tactical-lab.html e selecionar **Vitrine dos oito heróis**.
2. Verificar se armas e roupas mudam ao longo das oito cenas, incluindo martelo de Silas, adaga de Íria, lança de Dara e escudo de Lorena.
3. Testar PRÓXIMO e PULAR TUDO na sequência.
4. Voltar à campanha, reproduzir ataque e defesa; conferir PV e save.
5. Se houver sprites invisíveis/cortes visuais, registrar navegador, aparelho e captura.

**Próximo marco recomendado:** trocar a heurística por metadados visuais canônicos compartilhados com a campanha, desenhar spritesheets de vários quadros e implementar testes end-to-end com navegador.

## Entrega T2.12 — ataques por tipo de armamento (17/10/2026)

**Publicação:** v18 em `main`; prévia no laboratório: https://pedromaintenance.github.io/a-revolta-dos-mendigos/tactical-lab.html.

### Mudanças realizadas
- O popup cinematográfico reconhece `weaponType` de cada combatente procedural e altera a coreografia por classe de arma:
  - **Adaga (Íria):** preparação curta, investida rápida e dupla oscilação de transparência para sugerir golpe furtivo.
  - **Martelo (Silas):** preparação mais longa, elevação maior e golpe pesado com impacto e tremor de câmera mais intensos.
  - **Lança (Dara):** antecipação curta e avanço mais longo, visualizando uma estocada.
  - **Cajado (Marga, Olmo, Vega):** concentração com brilho arcano antes da liberação; o movimento representa efeito mágico, sem modificar alcance ou regras de combate.
  - **Escudo (Lorena):** investida específica, mantendo o escudo no modelo visual.
  - **Espada (Coto e inimigos comuns):** conserva uma cadência equilibrada.
- Os tempos de animação e contra-ataque agora são relativos ao impacto da arma: `windup`, `release`, `impact` e `recovery`. Isso evita que o dano apareça antes do fim da preparação de um martelo, por exemplo.
- A opção do laboratório foi renomeada para **Vitrine de ataques: oito heróis**, para destacar que ela permite comparar os estilos em sequência.
- `tests/cinematic-contract.test.js` verifica a existência dos arquétipos e dos gatilhos de tempo relativos ao impacto.
- `index.html` usa scripts `?v=18`; `sw.js` usa `revolta-cache-v18`; laboratório aponta para `battle-popup.js?v=18`.

### Garantias e limites
- Dano, PV, XP, save e turnos **não foram alterados**. A implementação modifica apenas a apresentação dos eventos já resolvidos pelo `app.js` ou pelo núcleo tático do laboratório.
- A animação é procedural; **ainda não usa spritesheets autorais quadro a quadro**.
- Estilos de cajado representam visualmente magia mesmo em um evento de ataque, mas não criam novas habilidades.
- Testes estáticos e commits não substituem QA visual. GitHub Actions precisa ser consultado para confirmar execução bem-sucedida.

### Aceite no Pages
1. Abrir laboratório, escolher **Vitrine de ataques: oito heróis**, reproduzir e comparar especialmente Íria, Silas, Dara e Vega.
2. Conferir que a vida diminui **no impacto**, não na preparação; Silas deve parecer mais lento e pesado que Íria.
3. Testar golpe final, contra-ataque e **PULAR TUDO** após uma sequência para verificar limpeza de timers e controles.
4. Testar um combate da campanha sem alterações no progresso salvo.

**Próximo marco:** spritesheets autorais e testes de renderização automatizados; posteriormente, migração gradual das batalhas da campanha para movimentação em grade.
