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
| P0 — Confiabilidade | Crítica | Corrigir índice de habilidade; testes de dano, cura, mortes, boss; sprites locais, Phaser local, tratar cache e HUD redundante | Rodada clássica e Phaser sem regressão em desktop/Android e PWA; testes automáticos básicos | Pendente |
| T1 — Protótipo em grade | Crítica | Grid 10×10 ou 12×10, 32 px, ocupação, terreno, cursor, casas válidas, movimento, A* ou Dijkstra, cancelamento | Coto move-se, respeita obstáculos, movimento e ação permanecem corretos após recarregar | Pendente |
| T2 — Núcleo Fire Emblem | Crítica | Alcance de armas/feitiços, ação após movimento, contra-ataque, previsão de dano/acerto, fases aliadas/inimigas, IA básica | Uma batalha completa vencível sem bugs e com decisões espaciais relevantes | Pendente |
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
