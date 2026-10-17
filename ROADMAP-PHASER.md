# Roadmap — Migração incremental para Phaser 3

Atualizado: 2026-10-16

## Diagnóstico
A versão atual é um RPG de estratégia narrativa mobile-first em JavaScript puro, com dados em `data.js`, regras/estado em `app.js`, interface em `index.html`/`style.css`, salvamento local v1 e PWA. A migração **não** deve substituir as regras existentes nem invalidar saves.

## Princípios
1. **Preservar a campanha**: 42 dias, 6 atos, 42 confrontos, personagens, missões, economia, escolhas e finais.
2. **Phaser como camada de apresentação**, sem duplicar lógica de combate. O estado canônico permanece no motor existente.
3. **Progressivo e reversível**: modo clássico sempre disponível até paridade funcional.
4. **Mobile primeiro**: canvas responsivo, toque, legibilidade, baixo consumo e orientação vertical.
5. **GitHub Pages/PWA**: caminhos relativos, assets locais, cache versionado e testes offline.
6. **Publicação por marcos**: publicar apenas entregas testáveis e registrar limitações.

## Marcos

| Marco | Escopo | Critério de aceite | Status |
|---|---|---|---|
| M0 — Auditoria | Mapear estado, funções de batalha, interface, persistência e publicação | Documento com arquitetura e riscos | Concluído |
| M1 — Fundação Phaser | Integrar Phaser 3 com carregamento controlado, canvas responsivo, fallback clássico | Jogo abre no Pages sem regressão e mostra uma cena Phaser de teste | Parcial: laboratório isolado e link no menu; ainda falta engine local e integração embutida |
| M2 — Visual de batalha | Cenário, combatentes, barras de PV/Foco, seleção visual e efeitos simples | Mesma batalha representada em canvas sem alterar regras | Parcial: canvas embutido com PV/Foco, seleção, guarda e estado de ação; atualização por remontagem entre ações, arte provisória |
| M3 — Interação | Toque nos alvos, animação de ataques, cura, proteção, efeitos e sincronização | Turno completo jogável via Phaser; mesma resolução do modo clássico | Parcial avançado: seleção e cinco comandos diretamente no canvas (ataque/habilidade/curativo/defesa/fim da rodada); suporte sobrenatural e histórico ainda em HTML, animações de golpes pendentes |
| M4 — Direção de arte | Pixel art autoral, cenários por ato, spritesheets e efeitos | Assets locais e visual consistente, sem dependência de CDN | Em andamento: silhuetas pixeladas provisórias com equipamentos por personagem; spritesheets e cenários definitivos pendentes |
| M5 — UX | Acessibilidade, feedback, áudio opcional, escala e otimização | Android e desktop, teclado/toque, desempenho aceitável | Pendente |
| M6 — PWA/QA | Cache de engine/assets, migração de saves, testes e release | Pages instalável, offline testado e regressões resolvidas | Pendente |

## Arquitetura-alvo

```text
data.js (conteúdo e narrativa)
      ↓
app.js (estado canônico, regras e persistência)
      ↓ eventos/adaptador unidirecional
src/phaser/ (cenas, sprites, animações, UI visual)
      ↓
canvas dentro da interface HTML existente
```

Evitar que cenas Phaser alterem diretamente `localStorage` ou a estrutura do save. Comandos de interação devem voltar ao motor original.

## Primeira fatia vertical
- Carregar Phaser sem bloquear a campanha clássica.
- Mostrar uma cena demonstrativa isolada com personagens e fundo provisório.
- Alternar modo clássico/Phaser sem recriar o save.
- Em seguida, conectar dados reais da batalha e implementar um turno completo.

## Riscos e mitigação
- **Save corrompido**: manter `v:1`, backup via exportação e testes de importação.
- **Regras divergentes**: única fonte de verdade no motor atual.
- **Dependência externa**: hospedar versão fixa de Phaser localmente antes de anunciar suporte offline.
- **Canvas ilegível no celular**: escala FIT, proporção vertical e UI híbrida quando necessário.
- **Regressão no Pages**: conservar modo clássico e validar build publicada.
- **Service worker**: revisar cache e atualização para evitar mistura de versões.

## Checklist de release
- [ ] Tela inicial e menus funcionam
- [ ] Nova partida e carregamento existentes funcionam
- [ ] Batalha clássica não sofre regressões
- [ ] Modo Phaser abre e fecha sem vazamentos
- [ ] Sem erros no console
- [ ] Teste Android e desktop
- [ ] Cache offline verificado
- [ ] Link do Pages conferido

## Registro de decisões
2026-10-16: optar por migração progressiva, mantendo regras e narrativa em JS, e não por reescrita integral imediata.

## Entrega de 16/10/2026 — laboratório ligado ao salvamento (M1/M2, parcial)

- O laboratório Phaser agora lê **somente** `carcaca.revolta.mendigos.save.v1` do mesmo navegador e origem; não grava nem migra o save.
- Durante a fase `battle`, mostra os heróis escalados, os inimigos instanciados na batalha, os PV atuais e a rodada real; ao tocar, apresenta PV e Foco disponível (heróis). Fora de batalha, mostra a companhia recrutada e os inimigos anunciados para o dia.
- O arquivo `index.html` oferece acesso ao laboratório pelo menu Arquivo da Revolta; o jogo clássico e as regras não foram modificados.
- O acesso direto é `/phaser-lab.html`. **Limitações:** a prévia não executa ataques, não recebe atualizações ao vivo, ainda usa personagens geométricos e depende de Phaser via CDN (não funciona offline sem cache prévio externo).
- **Teste manual recomendado:** iniciar campanha; preparar defesa e entrar em batalha; abrir o laboratório no mesmo navegador, em outra aba; comparar PV/nomes/rodada; voltar e executar um turno; recarregar o laboratório e conferir os novos valores. Verificar também a cena antes de começar campanha.

### Próximas atividades prioritárias
1. Isolar um adaptador de estado e comandos que sincronize o canvas no próprio `app.js`, sem acesso direto do Phaser a `localStorage`.
2. Hospedar Phaser localmente, adicionar arquivos ao service worker e validar atualização/offline.
3. Permitir ações de combate em Phaser chamando os comandos originais (`selectHero`, `targetE`, `actionAttack`) e habilitar alternância de interface sem reiniciar a campanha.
4. Substituir blocos provisórios por sprites pixel-art locais; preparar variações para seis distritos.

**QA:** revisão estática do código; publicação por commits na branch principal. Testes manuais em navegador e publicação efetiva do Pages ainda precisam ser confirmados.

## Entrega de 16/10/2026 — combate Phaser integrado (M2/M3, parcial)

**Publicação:** alterações diretamente na branch `main` para GitHub Pages. O modo Phaser **não é mais apenas um laboratório independente**: nas batalhas normais, `battleScreen()` monta a cena `phaser-battle.js` dentro da interface da campanha.

### Implementado
- Introduzido `phaser-battle.js`: cenário responsivo 420×460, unidades com PV e Foco, seleção, indicador de guarda, herói já utilizado e selo de Ulorian.
- Adicionado `window.RevoltBattleBridge` em `app.js`, com um **snapshot somente leitura do estado em memória** e `command(action)` devolvendo comandos para o `doAction` original.
- Clique/toque nos retratos Phaser direciona `selectHero:<id>` e `targetE:<id>`; **ataque, habilidades, cura, defesa, suporte sobrenatural e turno inimigo permanecem calculados exclusivamente pelo código original**.
- Após ações, a tela Phaser é reconstruída com dados atuais sem usar saves intermediários. `main()` descarta instâncias anteriores para evitar canvases duplicados.
- Mantidos os controles HTML de ações, registros de combate, menus e fluxos de história. Se Phaser falhar ao carregar, o DOM clássico permanece como fallback para continuar a campanha.
- `index.html` inclui `phaser-battle.js` antes de `app.js` e oculta os retratos clássicos quando o canvas está pronto.

### Limitações e próximos incrementos
1. A biblioteca Phaser ainda carrega via CDN e requer rede na primeira abertura; tornar o motor local é prioritário para PWA.
2. O cenário atual usa formas geométricas (temporárias), não os sprites pixel-art finais.
3. Os botões de ações permanecem HTML: a migração total da interface e animações de combate está pendente.
4. Na implementação atual, cada interação remonta a cena inteira; migrar para atualização incremental e transições entre ações.
5. Revisar o CSS do canvas nos tamanhos de celular, depurar eventos de toque e confirmar condições do boss final.
6. Integrar arquivos Phaser ao cache versionado, depois medir comportamento de atualização e uso offline.

### Roteiro de teste no GitHub Pages
- Abrir o jogo principal (`/index.html`), iniciar/continuar campanha e entrar em batalha.
- Verificar se o canvas Phaser aparece diretamente na tela de combate; selecionar Coto no **canvas**, tocar **Atacar** no HTML e selecionar o inimigo no **canvas**.
- Testar **Defender**, **Curativo**, habilidades (quando disponíveis), suporte e encerramento de rodada; observar log, mortes, vitória e continuidade da campanha.
- Se a CDN estiver indisponível, validar que a batalha clássica continua utilizável.
- Testar uma batalha salva, reload e resolução sem perda do save.

**Validação declarada:** código integrado e enviado ao GitHub. **Não houve teste automatizado de navegador, teste offline nem confirmação visual da implantação no Pages**; nenhuma dessas atividades é marcada como aprovada ainda.

## Entrega de 16/10/2026 — comandos de batalha dentro do canvas Phaser (M3)

A cena integrada `phaser-battle.js` tem agora **HUD Phaser interativo** de 420×650 (FIT responsivo). Os cinco comandos **Atacar, Habilidade, Curativo, Defender e Encerrar rodada** operam diretamente dentro do canvas. Quando o motor aguarda alvo, o HUD troca as ações por **Cancelar alvo** e indica se espera aliado ou inimigo.

- Botões desabilitados quando o personagem já agiu, está incapacitado, não possui Foco suficiente ou há falta de ervas; a ação de encerrar rodada permanece bloqueada enquanto alguém ainda pode agir.
- `RevoltBattleBridge.snapshot()` passou a incluir quantidade atual de ervas, além dos dados reais de heróis, inimigos e rodada.
- Não houve criação de segundo motor de dano, cura ou economia: cada toque chama `RevoltBattleBridge.command()` → `doAction()` do `app.js`.
- Os botões HTML permanecem como **fallback operacional** por ora; auxílios sobrenaturais e log seguem em HTML. Não desativar até que paridade seja testada.
- Visual ainda provisório; ao executar comandos, o canvas é remontado. Atualização incremental, efeitos, sprites e motor Phaser local continuam no backlog.

### Aceitação recomendada para este marco
1. Abrir o **jogo principal** no Pages, iniciar uma batalha e aguardar carregar o canvas.
2. Tocar em Coto, apertar **ATACAR** dentro do canvas, tocar no Guarda, observar atualização do PV e do log; testar **DEFENDER** e **ENCERRAR RODADA**.
3. Em uma batalha com Marga/Olmo, verificar habilidades de cura imediata; testar curativo escolhendo um aliado; confirmar bloqueio quando não houver 8 pontos de Foco ou ervas.
4. Confirmar que os controles de suporte especial seguem disponíveis abaixo do canvas, que uma vitória leva ao pós-batalha e que a campanha pode continuar.

**Verificação efetuada:** sintaxe JavaScript analisada e commits confirmados no GitHub. **Ainda não confirmado:** renderização real no dispositivo, desempenho e atualização do Pages. Não considerar M3 concluído até concluir QA do fluxo completo.

## Hotfix — campo Phaser invisível e cache desatualizado (16/10/2026)

**Relato:** ao entrar na batalha, os gráficos do Phaser não apareciam.

**Causa identificada no código:** o elemento `#phaser-battle` tinha `display:none` antes da criação do `Phaser.Game`. A configuração `Phaser.Scale.FIT` precisa medir o pai; entretanto, a classe que o tornaria visível (`phaser-ready`) era adicionada somente no `Scene.create()`. Essa dependência circular podia impedir uma cena válida de aparecer. Não foi possível coletar o console do navegador do usuário para confirmar se havia outro erro adicional.

**Correções aplicadas ao `main`:**
- Contêiner visível e com área mensurável durante a criação do motor; proporção `420/650` e espaço reservado para o FIT.
- Estados `phaser-loading` e `phaser-ready`; retratos clássicos só são escondidos quando o Phaser entra em `create()`. Falha de CDN passa a exibir aviso mantendo controles clássicos.
- `sw.js` substituído por service worker versionado `revolta-cache-v2`; arquivos essenciais são pré-armazenados e documentos/scripts consultam a rede primeiro, com fallback ao cache.
- `app.js` verifica o cache v2; `index.html` usa `?v=2` nos scripts modificados para reduzir o risco de versões misturadas.

**Escopo:** hotfix de inicialização e atualização; não muda save v1, cálculos do combate, narrativa nem atributos. Phaser continua no CDN e portanto **não há garantia de combate Phaser offline** (modo clássico como fallback).

**QA executado:** conferência das mudanças no GitHub e validação de sintaxe de `app.js`, `phaser-battle.js` e `sw.js`. **Pendente:** teste real em Chrome Android/desktop, verificação do SW instalado, confirmação de tela Phaser e publicação efetiva no Pages. O relato não deve ser marcado como solucionado definitivamente sem esse retorno.

**Teste solicitado:** abrir a campanha no Pages, entrar numa batalha; verificar o campo gráfico e os botões dentro do canvas; se persistir a versão antiga, recarregar a página conectada à internet e fechar/reabrir o PWA para ativar o cache v2. Se houver falha, observar o aviso textual e confirmar que os botões clássicos permanecem funcionais.

## Hotfix 2 — tela aparece brevemente e desaparece (17/10/2026)

**Evidência:** captura do jogador mostra a batalha do Dia 1 com uma área vazia de aproximadamente 420×650, sem unidades nem controles, e a interface HTML clássica oculta. O gráfico teria surgido por um instante e desaparecido.

**Diagnóstico de engenharia:** além do problema anterior de dimensionamento, a implementação executava `main()` e `Phaser.Game.destroy(true)` a cada seleção, alvo e ação, criando um novo `Phaser.Game` e um novo canvas em todas as atualizações. A marca de pronto ocorria no `Scene.create()`, antes da verificação de um frame efetivamente renderizado. Isso criava uma condição de corrida entre montagem, destruição e ocultação do fallback. Esta é uma hipótese de causa raiz sustentada pelo código, sem acesso ao console do navegador que reproduziu a falha.

**Correção no `main`:**
- `battleScreen()` detecta se a batalha já tem DOM e **não substitui o `#stage`** em ações subsequentes; atualiza apenas status, botões HTML e registro, salva e solicita `PhaserBattle.refresh()`.
- `PhaserBattle.refresh()` reinicia somente a **cena** para redesenhar dados atuais, sem destruir o objeto `Phaser.Game` nem o canvas. A instância só é destruída ao trocar de tela ou concluir batalha.
- `Phaser.CANVAS` força Canvas 2D nesta fatia, evitando problemas dependentes da inicialização WebGL. A lib continua no CDN, com fallback DOM.
- A classe `phaser-ready`, que oculta os retratos clássicos, só é aplicada após o evento `postrender`, com verificação de que o canvas existe, está conectado ao DOM e tem dimensões válidas.
- Cache do service worker atualizado para `revolta-cache-v3`, com query `?v=3` nos scripts para reduzir carga de versões antigas.

**Verificações realizadas:** commits confirmados no GitHub e sintaxe JS do bridge Phaser validada. **Não realizado:** teste automatizado de navegador, comprovação do canvas visível no Pages e teste real do service worker no dispositivo. Não marcar como resolvido até retorno do usuário ou prova de QA.

**Teste:** abrir o Pages com rede, atualizar, entrar na batalha Dia 1. O canvas deve permanecer visível após selecionar Coto e depois ao escolher Atacar → Guarda. Conferir turno inimigo, recarregar campanha salva e verificar se o registro e PV persistem. Se o erro continuar, solicitar mensagem específica do console do navegador e inspecionar eventuais erros de renderização e versão da CDN.

## Entrega visual — arena compacta e legibilidade (17/10/2026)

**Origem:** após confirmar que o Phaser passou a funcionar, o jogador reportou sprites em blocos excessivamente genéricos, nomes sobrepostos aos bonecos, personagens sem apoio no chão e enorme área vazia entre combate e HUD. Registro baseado na captura da batalha do dia 2, `A Tigela de Marga`.

**Publicado em `main`:**
- Cena reduzida de **420×650 para 420×520**; área de atuação, linha do chão e comandos ficam próximos, sem um vazio central de quase 200 px.
- Aliados à esquerda e Corte à direita, com régua central e cabeçalhos das facções; fachadas e calçamento com separação visual mais clara.
- Substituição dos retângulos únicos por silhuetas geométricas **pixel-art provisórias** montadas em Phaser: cabeça/cabelo ou capacete, corpo, braços, botas e acessórios como espada de Coto, panela de Marga e arma dos guardas.
- PV, Foco e nome exibidos abaixo de cada unidade; destaque de seleção, selo feérico, ação realizada e guarda preservados.
- Distribuição responsiva por quantidade: 1, 2, 3 e 4 unidades por facção usam coordenadas distintas e escalas progressivamente menores, evitando a sobreposição que ocorria nas fileiras originais.
- HUD com ações em duas linhas e botão de fim de rodada imediatamente abaixo. Fluxo de comandos e regras da campanha não alterados.
- Proporção do elemento de montagem revista para `420/520`, cache PWA atualizado para `revolta-cache-v4` e scripts marcados com `?v=4` para contornar versões antigas.

**Atenção:** não são spritesheets finais nem pixel art gerada como arquivo: por enquanto são desenhos de formas dentro do Phaser, planejados para serem substituídos por assets autorais. O campo foi refatorado visualmente, não houve migração do suporte sobrenatural nem do restante das telas para o Phaser.

**Teste recomendado no Pages:** retomar a batalha do dia 2, verificar se Coto/Marga e Guarda/Informante não se sobrepõem, selecionar herói e alvo, usar os comandos. Em batalhas futuras com 3–4 combatentes de cada lado, conferir nomes, barras e hitboxes; revisar em celular e desktop. **QA de navegador ainda pendente** — apenas validação estática e commits no GitHub.

## Entrega v5 — sprites CC0 e FX dinâmicos (16/10/2026)

**Motivação:** feedback do jogador com referência a combate JRPG pixelado: sprites dos combatentes ainda eram formados por quadrados sem animação; solicitado uso de free-assets e maior dinamismo visual.

### Implementação publicada em `main`
- O `phaser-battle.js` passou a carregar uma **imagem real de sprites** do pacote **Kenney Roguelike Characters** (sprites 16×16, licença CC0-1.0). Renderização pixelada ampliada dentro dos containers Phaser. O mapeamento de linhas e colunas é provisório e exige avaliação visual: esse spritesheet consiste em componentes/corpos frontais, não em animações completas.
- **Origem primária e licença:** https://kenney.nl/assets/roguelike-characters — Creative Commons Zero 1.0 (uso comercial permitido, atribuição opcional).
- **Espelho técnico empregado:** https://raw.githubusercontent.com/Two-Weeks-Team/openClawWorld/main/packages/client/public/assets/kenney/characters/characters_spritesheet.png — espelho de spritesheet do pacote Kenney. Origem de terceiros, **não é um arquivo versionado dentro do repositório do jogo**.
- Fallback gráfico geométrico quando a textura não está disponível; o jogo não deve depender de uma textura remota para executar suas regras.
- Animação **idle** de oscilação suave por unidade; avanço curto do combatente após realizar uma ação, efeito de trajetória, **shake/flash** ao receber dano, números de dano flutuantes, brilho e números positivos ao recuperar PV. Variação guiada pelo snapshot do estado canônico antes/depois do comando, sem alterar dano ou cura.
- Bridge `RevoltBattleBridge.snapshot()` passa a enviar `enemy.key` para permitir selecionar sprites por arquétipo; o save v1 não muda.
- Ajuste da proporção CSS `420/520` (antes a classe ready ainda referenciava 420/650); scripts ?v=5, cache `revolta-cache-v5`.

### Riscos conhecidos / próximo trabalho
- Imagens Kenney têm vista frontal e, nesse pack, são estáticas; idle/ataque são **tweens** sobre uma única imagem. Próximo passo para ação com quadros: localizar spritesheets licenciados com sequência de ataque/hurt/death, armazenar **arquivos PNG localmente** e substituir o espelho externo.
- A textura é buscada por HTTPS de `raw.githubusercontent.com`: pode falhar em conexões restritas e **não está garantida offline**. Ainda falta incorporar os binários ao GitHub; enquanto isso o fallback geométrico é usado.
- O Phaser 3 ainda é carregado da CDN jsDelivr, portanto o **combate Phaser não é offline garantido**. A alegação da interface de que o jogo está pronto offline se refere ao núcleo HTML/PWA.
- Efeitos são calculados pela diferença de PV; o avanço do atacante usa a transição do conjunto `acted` e não distingue golpes de ações de defesa. Melhorar a semântica via eventos estruturados do motor em versão futura.
- Não foi executado teste visual real no GitHub Pages nem verificação de CORS ou redimensionamento em Android. É obrigatório verificar a aparência e confirmar que os assets efetivamente carregam; se não carregarem, apenas os placeholders serão vistos.

### Como testar
1. Recarregar o jogo no Pages com conexão e entrar em batalha; conferir sprites pequenos em pixel art, sem os antigos blocos grandes.
2. Escolher Coto, usar Atacar e escolher um inimigo; observar avanço, flash vermelho e número do dano real. Testar cura com Marga/curativo para número positivo e brilho.
3. Testar morte, reinício da cena e continuação dos dias para conferir que o canvas não desaparece e que o jogo continua salvando.
4. Se aparecerem apenas os retângulos provisórios, inspecionar erros de rede/CORS do asset Kenney no console.

**Verificações feitas:** análise estática de sintaxe do JavaScript e commits no GitHub. Validação visual e funcional da entrega no Pages permanece pendente.

## Entrega v6 — formações diagonais e HUD legível (16/10/2026)

**Pedido:** seguindo referência visual de batalhas JRPG, reduzir a escala dos sprites Kenney e organizar 1–4 aliados/inimigos em posições alternadas, com mais profundidade, sem nomes e barras encavalados.

**Implementado no `main`:**
- Arena Phaser agora mede **420×560**, com faixa de ação separada visualmente na base. Aliados aparecem **à direita**, tropas da Corte **à esquerda**, de acordo com a composição da referência.
- Substituída a distribuição linear por formações diagonais distintas para 1, 2, 3 e 4 unidades: deslocamentos laterais alternados, distâncias verticais calculadas e escala por ocupação (0,90 / 0,78 / 0,68 / 0,60).
- Sprites 16×16 Kenney reduziram a ampliação base de **4,3× para 3,05×**, antes do ajuste por formação. Profundidade visual dos personagens usa `setDepth(100+y)`.
- Barras de PV, nomes abreviados e números de Foco foram deslocados para **HUDs de tamanho fixo**, independentes da escala do personagem, com painéis de fundo próprios; os alvos de toque diminuíram para evitar colisões entre unidades.
- Animação de avanço foi invertida para que aliados ataquem da direita em direção à esquerda; reações de impacto acompanham o lado correto.
- Ajustada quarta posição para permanecer acima da faixa de comandos. `index.html` usa proporção `420/560` e `?v=6`; cache versionado `revolta-cache-v6`.

**Sem mudanças:** valores de dano, habilidades, cura, campanha, save v1 e interface narrativa. Os sprites gratuitos ainda são externos e o motor Phaser ainda depende de CDN: não declarar offline completo.

**QA pendente:** renderização e toque em Android/desktop, legibilidade em grupos de quatro, animações após turnos e conferência de cache atualizado no GitHub Pages. Código submetido e sintaxe JavaScript verificada, mas não foi realizado teste funcional de navegador nesta entrega.

**Roteiro curto:** abrir a batalha do dia 3, confirmar inimigos à esquerda e aliados à direita; verificar que cada unidade possui nome/HP próprio sem cobrir outros sprites; executar ataque e encerrar rodada; repetir com quatro unidades por facção.

## Pesquisa de referências e hotfix v7 — estabilidade antes de estética (16/10/2026)

**Evidência do jogador:** no primeiro combate, a barra do Coto é visível, mas seu personagem não; a arena tem excesso de espaços, duplicação de informações abaixo e uso irregular das imagens de personagens.

### Referências técnicas consultadas
- Documentação oficial Phaser — **Display List**: https://docs.phaser.io/phaser/concepts/gameobjects/display-list
- Documentação oficial Phaser — **Depth e Containers**: https://docs.phaser.io/phaser/concepts/gameobjects/components
- Documentação oficial Phaser — **Textures / Frames**: https://docs.phaser.io/phaser/concepts/textures
- Tutorial de RPG por turnos em Phaser 3: https://gamedevacademy.org/how-to-create-a-turn-based-rpg-game-in-phaser-3-part-1/
- Exemplo Phaser de combate por turnos: https://phaser.io/news/2018/02/turn-based-battle-system-tutorial

**Decisão de arquitetura:** adotar elementos funcionais de JRPG clássico: camada do cenário separada da apresentação das unidades e controles, renderização determinística, informações visíveis independentemente do tamanho do sprite, sem reimplementar as regras do `app.js`. Não expandir efeitos ou menus até o desenho básico permanecer íntegro após refresh/turnos.

### Correções publicadas na branch `main` (v7)
- `phaser-battle.js`: verificações simples de alfa nas células 16×16 do spritesheet Kenney, em vez de assumir que toda coordenada selecionada tem imagem útil; busca determinística por outra linha da mesma coluna.
- Se o arquivo externo ou a célula não produzir pixels suficientes, cria-se uma silhueta local legível (corpo, rosto, cabelo e pernas) para **evitar herói invisível**.
- Camada `Graphics` do cenário recebe `depth=-1000`, unidades `100+y`, painéis de informação `800`, áreas de toque `900`; assim a ordem de renderização fica explícita.
- Incremento do cache para `revolta-cache-v7` e scripts `?v=7` para que o Pages e a PWA possam buscar a versão nova.

### QA / critérios para próxima entrega
- [ ] Todos os heróis e inimigos visíveis no dia 1 e no dia 3, incluindo Coto
- [ ] Confirmar ausência de recobrimento dos personagens pelo piso ou pelo HUD
- [ ] Verificar seleção de personagem/alvo no toque
- [ ] Confirmação visual do Pages em dispositivo real
- [ ] Refatorar o HUD duplicado (HTML/Phaser) só depois que o comportamento básico for comprovado
- [ ] Substituir colunas manuais de atlas por imagens locais com frames certificados
- [ ] Planejar separação mais clara de `BattleScene` / `BattleUIScene`, inspirada no tutorial de Phaser

**Verificado:** commits do GitHub e validação de sintaxe do script atualizado. **Não verificado:** comportamento real no Chrome, cache no dispositivo, características dos sprites carregados pela URL externa. O problema deve permanecer como **aguardando reteste** no roadmap.

## Entrega v8 — combatentes menores e roster superior (16/10/2026)

**Pedido:** sprites aproximadamente 20% menores, mais separados, apoiados visualmente no piso; nomes e estatísticas fora da arena, numa HUD superior; deixar somente a barra de vida próxima de cada personagem.

**Publicada na `main`:**
- Sprite Kenney de 3,05× → **2,44× (redução de 20%)**; escalas de formação também multiplicadas por 0,8 para reduzir a ocupação em batalhas com vários participantes. O fallback local geométrico foi encolhido proporcionalmente.
- Ajustada âncora do sprite para a base (`origin(.5,1)`) e posição relativa `y=-8`; sombras ficam perto dos pés. Os combatentes foram reposicionados para a parte inferior do quadro, preservando a faixa de comandos em `y=409+`.
- Novas formações diagonais com maior afastamento lateral e vertical, específicas para 1 a 4 unidades por facção.
- **Roster/HUD superior separado por Corte e Resistência**, mostrando nome e PV atuais; item selecionado recebe destaque, e cada linha aceita clique/toque para escolher aliado ou alvo.
- No campo de batalha, o HUD de cada unidade foi reduzido a uma pequena barra de vida colorida, sem nome ou números que sobreponham o sprite.
- Nenhuma alteração das regras, da campanha e do formato de save. Cache PWA `revolta-cache-v8` e scripts `?v=8`.

**Critérios de aceite para testar no Pages:** personagens visíveis, sem flutuar longe de suas sombras; roster do topo legível e selecionável; PV alterado no topo e na barra do personagem após golpes; sem sobreposição de personagens e ações com 1–4 unidades; sobrevivência da cena a vários turnos.

**QA:** commit e sintaxe JS verificados; ainda falta teste visual em Chrome desktop/Android e confirmação de atualização do Pages. O Phaser e os sprites Kenney continuam carregados de domínios externos e o modo Phaser offline não é garantido.
