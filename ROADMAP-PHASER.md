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
| M1 — Fundação Phaser | Integrar Phaser 3 com carregamento controlado, canvas responsivo, fallback clássico | Jogo abre no Pages sem regressão e mostra uma cena Phaser de teste | Pendente |
| M2 — Visual de batalha | Cenário, combatentes, barras de PV/Foco, seleção visual e efeitos simples | Mesma batalha representada em canvas sem alterar regras | Pendente |
| M3 — Interação | Toque nos alvos, animação de ataques, cura, proteção, efeitos e sincronização | Turno completo jogável via Phaser; mesma resolução do modo clássico | Pendente |
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
