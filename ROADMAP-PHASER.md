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
| M4 — Direção de arte | Pixel art autoral, cenários por ato, spritesheets e efeitos | Assets locais e visual consistente, sem dependência de CDN | Pendente |
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
