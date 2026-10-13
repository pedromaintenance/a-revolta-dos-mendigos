/* A Revolta dos Mendigos — conteúdo original inspirado no universo da Carcaça. */
const DB={
 acts:[
  ['A PRIMEIRA ESPADA','Antes de uma bandeira, existiu um mendigo e a misericórdia improvável de um halfling.'],
  ['A CHUVA DE OURO','A vassoura sobre o Distrito Afogado transformou esperança em insurreição.'],
  ['A FOME E O FERRO','A Corte compreende que não enfrenta um saque, mas uma cidade que se organiza.'],
  ['ESCADAS PARA A CIDADE ALTA','Portões, tribunais e casas nobres entram na disputa.'],
  ['A COROA SOBRE O RIO','A Rainha observa; Ulorian decide que sua autoridade precisa ser restaurada.'],
  ['O NOME DO REI','A força de um povo chega até a porta do impossível: a magia de um grande senhor feérico.']
 ],
 heroes:[
  ['coto','Coto da Ponte','Espadachim','⚔',50,11,4,8,'levante','O mendigo da primeira espada; mantém o metal sempre limpo, mesmo que não tenha sapatos.'],
  ['marga','Marga dos Caldos','Curandeira','✚',45,5,8,6,'partilha','Uma cozinheira expulsa da cozinha da Cidade Alta. Nenhuma pessoa fica sem sopa ao seu lado.'],
  ['iria','Íria dos Telhados','Batedora','⌁',43,9,5,13,'sombra','Corre pelos telhados e conhece os desvios que os mapas da Corte omitem.'],
  ['silas','Silas Ferrugem','Ferreiro','⚒',61,12,3,4,'martelo','Quebra algemas e transforma utensílios em armas de resistência.'],
  ['olmo','Olmo Canta-Água','Bardo','♫',42,6,10,7,'canto','Suas canções fazem a fome parecer menos definitiva e a coragem menos solitária.'],
  ['dara','Dara das Redes','Barqueira','≋',54,10,5,9,'rede','Conhece as correntezas dos canais afogados e os segredos dos armazéns.'],
  ['vega','Vega Cinza','Feiticeira','✧',39,8,14,8,'brasa','Uma escrava liberta cujo primeiro feitiço queimou o próprio registro de propriedade.'],
  ['lorena','Lorena das Portas','Escudeira','⬡',76,9,5,4,'baluarte','Veterana que desertou após receber ordem de expulsar idosos das vielas.']
 ],
 enemies:{
  guarda:['Guarda de Tributo','♜',28,7,2,'soldado'], arqueiro:['Arqueiro da Torre','➶',25,9,1,'atirador'], carcereiro:['Carcereiro Élfico','⛓',40,10,3,'soldado'], sabujo:['Sabujo de Sombra','◈',30,9,0,'fera'], espião:['Informante da Corte','◉',23,8,1,'furtivo'], lancas:['Lanceiro Shadar','⚑',43,11,4,'soldado'], espectro:['Espectro do Canal','☾',40,11,2,'espectral'], carniceiro:['Executor da Ponte','⚔',51,13,4,'brutal'], bruxa:['Feiticeira da Corte','✧',40,14,1,'magia'], golem:['Golem das Taxas','▣',62,12,8,'tanque'], cambion:['Mercenário Demoníaco','♠',52,14,4,'brutal'], cavaleiro:['Cavaleiro da Guarda','♞',65,15,6,'elite'], vigia:['Vigia do Espelho','◈',45,12,4,'magia'], sanguessuga:['Sanguessuga do Canal','◌',38,11,2,'fera'], sacerdote:['Sacerdote Lunar','☽',54,11,4,'cura'], assassino:['Lâmina Crepuscular','✦',48,17,3,'furtivo'], inquisidor:['Inquisidor Uln-Shayr','⚖',72,16,6,'elite'], fantasma:['Cavaleiro Espectral','♞',64,17,5,'espectral'], colosso:['Guardião de Osso','⬡',90,18,9,'tanque'], arauto:['Arauto da Rainha','♛',83,19,6,'magia'], senescal:['Senescal da Noite','♜',102,20,8,'elite'], ulorian:['Ulorian Uln-Shayr','♛',375,24,12,'rei']
 },
 districts:[
  ['afogado','Distrito Afogado','Canais apodrecidos, pontes de corda e gente que a Corte considera descartável.'],
  ['ponte','Ponte dos Tributos','O pedágio que transforma trabalho, água e passagem em propriedade nobre.'],
  ['mercado','Mercado de Baixo','Forjas clandestinas, barracas de sopa e comerciantes com mais medo do que lealdade.'],
  ['canais','Canais das Lamentações','Ruas sob o nível das águas onde os registros oficiais desaparecem.'],
  ['escadas','Escadarias da Alta','O limiar entre servidão e conforto, guarnecido por lanças e símbolos de poder.'],
  ['alta','Cidade Alta','Palácios, arquivos, o trono fluvial e a arquitetura da impunidade.']
 ],
 jobs:[
  {id:'sopa',title:'Cozinha coletiva',ico:'♨',desc:'Produzir alimento e cuidar dos que passam fome.',cost:{moeda:5},get:{comida:13,esperanca:3},tag:'solidariedade'},
  {id:'recrutar',title:'Assembleia das vielas',ico:'✊',desc:'Organizar novos moradores e fortalecer a coesão.',cost:{comida:5},get:{povo:5,esperanca:6},tag:'solidariedade'},
  {id:'forja',title:'Forjas clandestinas',ico:'⚒',desc:'Transformar sucata em armas e ampliar a defesa.',cost:{moeda:12,sucata:6},get:{armas:7},tag:'ferro'},
  {id:'buscar',title:'Catadores dos canais',ico:'◈',desc:'Recuperar metal, ervas e objetos úteis.',cost:{comida:3},get:{sucata:10,ervas:3},tag:'recursos'},
  {id:'cuidar',title:'Curar os feridos',ico:'✚',desc:'Recuperar a saúde da companhia e reduzir o trauma.',cost:{comida:4,ervas:3},heal:true,get:{esperanca:2},tag:'solidariedade'},
  {id:'espionar',title:'Olhos nas muralhas',ico:'⌁',desc:'Descobrir os planos militares e as fraquezas da Corte.',cost:{moeda:4},get:{intel:7},tag:'informação'},
  {id:'mensagem',title:'Panfletos e cantigas',ico:'♫',desc:'Espalhar relatos e aumentar a legitimidade do levante.',cost:{moeda:6},get:{esperanca:7,legitimidade:5},tag:'solidariedade'},
  {id:'ocultar',title:'Rede de esconderijos',ico:'⌂',desc:'Preparar rotas de fuga e diminuir a caça aos rebeldes.',cost:{sucata:6,moeda:6},get:{abrigo:7},tag:'segurança'},
  {id:'treinar',title:'Treinar a companhia',ico:'⚔',desc:'Exercícios de escudo, lâmina, tática e disciplina.',cost:{comida:7,armas:2},train:true,get:{},tag:'combate'},
  {id:'negocear',title:'Comprar mantimentos',ico:'◇',desc:'Converter moeda em alimento e ervas no mercado.',cost:{moeda:14},get:{comida:18,ervas:2},tag:'comércio'},
  {id:'contribuir',title:'Doações dos bairros',ico:'☷',desc:'Receber moedas das oficinas e bancas solidárias.',cost:{esperanca:3},get:{moeda:16},tag:'comércio'},
  {id:'vigiar',title:'Sentinelas de bairro',ico:'♜',desc:'Armar grupos para reduzir a força do próximo ataque.',cost:{povo:2,armas:3},get:{defesa:8},tag:'segurança'}
 ],
 chapters:[
  [
   ['A Primeira Espada','Um cobrador tenta arrancar de Coto as moedas dadas pelo paladino. Nenhum mendigo possui o direito de comprar aço — diz o decreto.','afogado','guarda','A primeira lâmina não corta o mundo ao meio; apenas prova que ele pode ser contrariado.'],
   ['A Tigela de Marga','Guardas chutam os caldeirões de uma cozinha comum e exigem tributo até pela água da sopa.','afogado','guarda,espião','Uma panela recolocada no fogo torna-se o primeiro ponto de reunião.'],
   ['Contas no Cais','O cobrador da Ponte dos Tributos toma um barco e ameaça despejar os barqueiros.','ponte','guarda,arqueiro','O recibo do tributo vai parar no fogo. Na margem, alguém começa a cantar.'],
   ['A Vassoura no Céu','Uma figura minúscula cruza o Distrito Afogado numa vassoura. Ouro cai sobre os telhados, e com ele cai o medo de comprar uma espada.','afogado','guarda,guarda,sabujo','As moedas do céu compram aço, pão e a audácia de erguer barricadas.'],
   ['O Primeiro Estandarte','Os rebeldes levantam uma bandeira de sacos costurados. A Corte envia arqueiros para abatê-la.','mercado','arqueiro,guarda,espião','O estandarte continua de pé, ainda que perfurado.'],
   ['A Lista dos Sem-Nome','Um escrivão chega com nomes de famílias destinadas à expulsão. Os mendigos recusam a ordem.','afogado','carcereiro,guarda','Pela primeira vez, um decreto deixa de ser destino.'],
   ['O Cavaleiro da Fenda','Um cavaleiro demoníaco surge entre as lanternas quebradas. Ele oferece sua espada e sussurra que a vingança não precisa de limites.','ponte','carniceiro,lancas','A multidão teme o demônio e, ao mesmo tempo, celebra a queda dos perseguidores.']
  ],[
   ['O Leilão Interrompido','Pessoas são vendidas sob proteção armada. Libertá-las exige romper o cordão de lanceiros sem esmagar os reféns.','mercado','lancas,carcereiro,sabujo','As correntes quebradas passam a adornar o portão da cozinha coletiva.'],
   ['As Janelas Fechadas','Moradores da Cidade Alta lançam lixo sobre os pobres em retirada, enquanto um arqueiro atira das janelas.','escadas','arqueiro,arqueiro,guarda','Os becos aprendem a ter escudos acima das cabeças.'],
   ['O Sino de Inverno','O toque do sino ordena recolher mendigos durante a noite. Desobedecer é tratado como insurreição.','mercado','carcereiro,sabujo,guarda','O sino muda de dono e anuncia abrigo, não recolhimento.'],
   ['A Barqueira e a Chave','Dara descobre que um bloqueio nos canais esconde prisioneiros políticos.','canais','sanguessuga,espectro,carcereiro','A água leva as embarcações libertadas para o refúgio.'],
   ['Provisões Confiscadas','A Corte fecha os armazéns e tenta vencer a revolta pela fome.','ponte','lancas,lancas,arqueiro','Sacos de grão chegam às famílias sem passar pelo palácio.'],
   ['Homens de Ferro','O primeiro construto fiscal é ativado: uma máquina que avalia corpos como se fossem dívida.','mercado','golem,guarda','Os catadores descobrem como desmontar uma lei feita de engrenagens.'],
   ['A Carta de Birka','Um emissário da Casa Uln-Shayr exige rendição. Sua carta chama a revolta de desordem zoológica.','escadas','cavaleiro,bruxa,guarda','A carta é lida em voz alta, para que todos conheçam o desprezo dos lordes.']
  ],[
   ['A Ponte dos Mortos','Espectros dos canais são chamados para aterrorizar quem esconde fugitivos.','canais','espectro,espectro,sanguessuga','As aparições recuam; os vivos não precisam pedir permissão para viver.'],
   ['A Oficina Incendiada','Agentes da Corte tentam destruir a forja clandestina que equipa os rebeldes.','mercado','assassino,lancas,bruxa','As ferramentas queimadas viram novos símbolos da resistência.'],
   ['A Cadeira Vazia','Uma assembleia popular é atacada quando tenta escolher representantes rotativos.','afogado','inquisidor,arqueiro,guarda','A cadeira permanece vazia: nenhum rei foi escolhido para substituí-la.'],
   ['A Moeda Marcada','Moedas falsas circulam entre os pobres para desacreditar a bênção do halfling.','mercado','espião,vigia,cavaleiro','As marcas do engano são expostas à luz dos bairros.'],
   ['O Julgamento da Fome','Um sacerdote lunar transforma pedidos de pão em acusações de blasfêmia.','ponte','sacerdote,carcereiro,lancas','O primeiro tribunal aberto acontece nas escadarias, diante dos trabalhadores.'],
   ['Os Filhos do Pântano','Criaturas sombrias cercam as rotas de fuga. A cidade baixa precisa decidir quem ficará para guardar a retirada.','canais','sabujo,sanguessuga,espectro','Os barcos partem levando quem não podia empunhar uma espada.'],
   ['O Banquete de Sal','A Corte oferece perdão a líderes selecionados. O banquete é uma emboscada.','escadas','inquisidor,cavaleiro,bruxa','A palavra perdão deixa de bastar sem reparação.']
  ],[
   ['O Primeiro Degrau','Os rebeldes chegam à subida da Cidade Alta. Cada degrau é protegido como propriedade da nobreza.','escadas','lancas,lancas,arqueiro','A distância entre os bairros, antes intransponível, diminui por um lance de escadas.'],
   ['Os Espelhos Vigiam','Vigias feéricos usam espelhos encantados para identificar rostos e delatores.','alta','vigia,vigia,assassino','Os espelhos são virados para o céu, onde nenhuma licença é exigida.'],
   ['A Ala dos Debaixo','Serviçais da Alta tentam aderir à revolta. A Corte responde com um executor e mercenários.','alta','carniceiro,cavaleiro,guarda','Os serviçais entram pela primeira vez numa assembleia como iguais.'],
   ['A Capela Afogada','Um altar fora de uso é reativado para impedir a subida dos trabalhadores.','canais','sacerdote,espectro,bruxa','A capela encontra outra função: hospital e memória dos mortos.'],
   ['A Ceifa dos Arquivos','O palácio tenta destruir os registros de servidão e os títulos que comprovam propriedades roubadas.','alta','inquisidor,vigia,assassino','Os livros sobreviventes recebem cópias feitas à mão.'],
   ['Uma Noite Sem Pontes','A Corte destrói passagens entre os distritos, isolando famílias e unidades da resistência.','ponte','colosso,arqueiro,lancas','Os moradores constroem travessias temporárias com madeira recuperada.'],
   ['A Porta do Sol Frio','O portão externo da Cidade Alta se abre para deixar entrar a guarda de elite.','alta','cavaleiro,cavaleiro,bruxa','A Cidade Alta deixa de parecer um mundo separado da fome que a sustentava.']
  ],[
   ['O Último Imposto','O tesoureiro da Corte exige dízimos para financiar a repressão.','mercado','golem,inquisidor,cavaleiro','As moedas recolhidas são destinadas às casas arruinadas.'],
   ['O Juramento Roubado','Um arauto oferece títulos à liderança rebelde em troca da dissolução das assembleias.','alta','arauto,cavaleiro,guarda','Os títulos são recusados e a promessa é exposta em praça pública.'],
   ['A Guarda sem Rosto','Soldados da Corte usam máscaras para ocultar de suas famílias o trabalho repressivo.','escadas','assassino,assassino,inquisidor','Algumas máscaras caem; algumas consciências também se revelam.'],
   ['A Maré ao Contrário','Ulorian altera a corrente do rio para afogar as passagens conquistadas.','canais','espectro,sacerdote,colosso','A cidade compreende que o rio possui um senhor, mas não necessariamente um dono.'],
   ['O Sino das Casas','As casas menores dos elfos enviam contingentes para tentar conquistar favor político.','alta','cavaleiro,bruxa,vigia','As casas descobrem que nem todos os seus nomes protegem seus soldados.'],
   ['O Arquivo da Vergonha','Um escriba decide revelar os registros de condenações por fome. Um senescal tenta silenciá-lo.','alta','senescal,carcereiro,lancas','Os registros provam que a miséria foi governada por decreto.'],
   ['O Decreto das Águas','Ulorian decreta que o próprio rio pertence à Casa Uln-Shayr, inclusive seus afluentes.','ponte','arauto,sacerdote,colosso','O decreto é rasgado, mas a magia do Rio permanece.']
  ],[
   ['O Palácio Respira','A Cidade Alta é tomada por uma névoa feérica que transforma portas em labirintos.','alta','vigia,bruxa,arauto','Os rebeldes marcam as paredes com nomes daqueles que não retornaram.'],
   ['O Último Mercador','Mercadores oferecem ajuda ao levante por monopólios futuros. Um esquadrão da Corte interrompe a negociação.','mercado','senescal,cavaleiro,guarda','Os moradores descobrem o preço de trocar um senhor por outro.'],
   ['Os Degraus do Trono','As tropas finais guardam os degraus onde a autoridade do Senhor do Rio é proclamada.','alta','senescal,arauto,cavaleiro','A última passagem militar cai; a passagem mágica continua fechada.'],
   ['A Audiência Negada','Uma delegação pede a Ulorian que reconheça os vivos do Distrito Afogado. Ele responde com o silêncio e uma legião de sombras.','alta','fantasma,fantasma,arauto','O povo não recebe audiência, mas agora pode exigir presença.'],
   ['As Águas da Coroa','O próprio palácio ordena às águas que capturem fugitivos e revertam os ganhos da revolta.','canais','colosso,sacerdote,espectro','O rio agitado mostra o tamanho do poder contra o qual caminharam.'],
   ['A Noite dos Dois Convites','O paladino oferece uma bênção sem exigir massacre. O cavaleiro promete vitória rápida se puder decidir quem merece viver.','escadas','arauto,senescal,assassino','A escolha final é adiada por mais uma noite, mas já pesa em cada mão.'],
   ['Ulorian, Rei do Rio','A presença do Lorde Uln-Shayr dobra luz e correnteza. Lâminas comuns atravessam sua imagem e acertam apenas o reflexo.','alta','ulorian,vigia','A vitória não depende apenas de ferro: é a natureza do poder do Rio que precisa ser rompida.']
  ]
 ],
 quests:[
  ['A conta da velha Marta',2,1,'Uma idosa perdeu a casa para uma dívida inventada. Recuperar a escritura pode impedir outras expulsões.','Comprovar a fraude', 'Tomar a casa do cobrador', {intel:2},{legitimidade:9,esperanca:6},{moeda:20,crueldade:7},'marga'],
  ['O depósito da ponte',3,1,'Trabalhadores descobriram armas escondidas entre as caixas do tributo.','Dividir entre as vielas','Armar só o núcleo', {intel:3},{armas:9,povo:3},{armas:12,crueldade:4},'coto'],
  ['Cantos das águas',4,1,'Olmo conhece uma canção que atravessa os canais e convoca quem a polícia não alcança.','Ensinar a canção','Usar para atrair guardas', {comida:3},{esperanca:12,legitimidade:4},{intel:10,crueldade:4},'olmo'],
  ['A linha dos fugitivos',5,1,'Há um caminho seguro que só Íria conhece entre os telhados.','Escoltar famílias','Sabotar sentinelas', {comida:4},{povo:5,abrigo:7},{armas:6,intel:4},'iria'],
  ['O ferro de Silas',7,2,'O antigo patrão de Silas guardou aço roubado dos artesãos da baixa.','Recuperar para todos','Fundir para a guarda', {sucata:4},{armas:10,legitimidade:5},{armas:14,crueldade:5},'silas'],
  ['As correntes de Dara',9,2,'Uma prisão fluvial transporta famílias endividadas.','Libertar e alimentar','Trocar reféns por ouro', {intel:4},{povo:7,esperanca:7},{moeda:31,crueldade:12},'dara'],
  ['Os documentos de fome',10,2,'O arquivo dos tributos prova que a cobrança foi deliberadamente aumentada.','Publicar os números','Chantagear a nobreza', {intel:5},{legitimidade:13,esperanca:6},{moeda:23,intel:6,crueldade:5},'iria'],
  ['O juramento da escudeira',12,2,'Lorena desertou da guarda. Muitos desconfiam de sua lealdade.','Dar-lhe uma segunda chance','Exigir confissão pública', {comida:6},{legitimidade:6,esperanca:6},{intel:6,crueldade:5},'lorena'],
  ['Os nomes queimados',14,2,'Vega pode recuperar memórias mágicas de uma lista de escravos destruída.','Restaurar os nomes','Usar os nomes como maldição', {ervas:5},{legitimidade:10,esperanca:8},{defesa:10,crueldade:13},'vega'],
  ['A panela e o brasão',16,3,'Marga encontrou o selo de um mercador que roubou mantimentos destinados à caridade.','Criar distribuição regular','Emboscar os fornecedores', {intel:4},{comida:24,legitimidade:7},{comida:30,crueldade:7},'marga'],
  ['O primeiro tribunal',17,3,'Rebeldes capturaram um guarda que espancava famílias. O bairro quer julgá-lo.','Exigir testemunhas','Entregar à multidão', {intel:4},{legitimidade:12,esperanca:5},{esperanca:9,crueldade:15},'coto'],
  ['O moinho de luz',19,3,'Uma oficina serve secretamente de hospital, mas precisa de reparos.','Reerguer o hospital','Transformar em casamata', {sucata:12},{ervas:12,esperanca:8},{defesa:13,armas:5},'silas'],
  ['Portas sem dono',21,3,'Lorena conhece os turnos da muralha. Há famílias de soldados que também passam fome.','Oferecer deserção','Eliminar o pelotão', {intel:6},{povo:8,legitimidade:9},{defesa:14,crueldade:13},'lorena'],
  ['Tornozeleiras de prata',23,4,'Um carregamento de grilhões ornamentados abastece a Cidade Alta.','Destruir os grilhões','Vender ao mercado negro', {intel:5},{esperanca:12,legitimidade:8},{moeda:30,crueldade:7},'dara'],
  ['O livro dos portões',24,4,'Uma criança encontra um livro com rotas de manutenção, mas teme entregá-lo.','Garantir proteção à família','Tomá-lo sem testemunhas', {comida:4},{intel:15,legitimidade:5},{intel:19,crueldade:8},null],
  ['A lamparina da velha ponte',26,4,'Olmo aprende o cântico de um antigo vigia, capaz de afastar aparições.','Cantar pelos mortos','Invocar a vingança deles', {ervas:4},{esperanca:14,abrigo:6},{defesa:16,crueldade:12},'olmo'],
  ['O favor do Halfling',28,4,'O paladino pede que os feridos inimigos recebam água. Sua bênção depende de que a revolta continue humana.','Proteger os rendidos','Priorizar as armas', {comida:9},{bencao:20,legitimidade:12},{armas:16,crueldade:11},'coto'],
  ['A lâmina da Fenda',29,5,'O cavaleiro demoníaco oferece uma espada que atravessa juramentos e apodrece votos.','Recusar a lâmina','Aceitar o pacto', {intel:6},{bencao:12,legitimidade:6},{pacto:22,crueldade:13},'vega'],
  ['A filha do juiz',31,5,'Uma jovem da alta pede abrigo após denunciar a própria casa nobre.','Acolher e ouvir','Exigir pagamento pela proteção', {comida:7},{intel:9,legitimidade:10},{moeda:25,crueldade:6},null],
  ['O barco sem bandeira',32,5,'Pescadores conhecem uma rota clandestina para trazer alimentos ao distrito.','Abrir rota comunitária','Monopolizar a travessia', {moeda:8},{comida:29,abrigo:6},{moeda:27,comida:12,crueldade:7},'dara'],
  ['A pena do escrivão',34,5,'Documentos revelam como o rio foi apropriado por Ulorian.','Copiar para todos','Guardar como moeda de troca', {intel:8},{legitimidade:16,intel:8},{moeda:29,intel:13},'iria'],
  ['O irmão do demônio',36,6,'O cavaleiro promete romper um selo da Corte se aceitarem perseguir até os vencidos.','Recusar a caçada','Dar carta branca ao cavaleiro', {intel:7},{bencao:12,legitimidade:8},{pacto:24,crueldade:20},null],
  ['O banquete dos ausentes',37,6,'Marga organiza uma mesa para quem sobreviveu, inclusive desertores que não feriram ninguém.','Dividir a última farinha','Fechar a porta aos desertores', {comida:10},{esperanca:18,bencao:7},{defesa:8,crueldade:6},'marga'],
  ['Um nome para a praça',39,6,'Os bairros pretendem nomear a praça conquistada. Quem será lembrado?','Os trabalhadores mortos','Os chefes da revolta', {intel:3},{legitimidade:15,bencao:8},{esperanca:7,pacto:6},'olmo'],
  ['As duas chaves',41,6,'Uma porta encantada reage tanto à graça divina quanto à violência demoníaca. Não é a mesma chave para as duas fechaduras.','Estudar a graça','Oferecer sangue da guerra', {intel:8},{bencao:18,intel:6},{pacto:18,defesa:9,crueldade:10},'vega']
 ],
 choices:{
  4:{title:'MOEDAS SOBRE OS TELHADOS',text:'O paladino de Grama-Cortada passa voando numa vassoura sobre o Distrito Afogado. Sua bolsa se abre: centenas de moedas brilham sobre telhados e vielas. A fome não acabou, mas agora a espada não é privilégio dos senhores.',options:[['Transformar o ouro em cozinhas e armas partilhadas',{moeda:55,armas:14,povo:11,esperanca:19,bencao:14,legitimidade:9}],['Comprar armas imediatamente e marchar',{moeda:48,armas:22,povo:15,esperanca:11,bencao:7}]]},
  7:{title:'O CAVALEIRO DA FENDA',text:'Um cavaleiro de armadura negra surge contra a guarda da Ponte. Ele luta pela revolta, mas deseja arrastar os inimigos rendidos para punições cruéis. Sua oferta é simples: poder sem limites.',options:[['Aceitar sua espada, impor limites claros',{pacto:18,bencao:5,esperanca:7}],['Deixar que decida o destino dos prisioneiros',{pacto:36,crueldade:20,defesa:10,legitimidade:-9}]]},
  12:{title:'OS PRISIONEIROS DO AÇOUGUE',text:'Um pequeno grupo de soldados da Corte está preso. O cavaleiro os aponta como alvos fáceis. Um trabalhador pergunta se não seria melhor ouvi-los.',options:[['Abrir um julgamento público',{legitimidade:15,bencao:12,esperanca:5,intel:5}],['Permitir represálias e tomar os uniformes',{crueldade:17,pacto:12,armas:9,legitimidade:-10}]]},
  17:{title:'A ASSEMBLEIA DIVIDIDA',text:'O levante precisa decidir quem fala em seu nome. A Corte oferece títulos e tributos àqueles que aceitarem governar as vielas por ela.',options:[['Representantes revogáveis de cada bairro',{legitimidade:15,povo:7,bencao:4,moeda:-7}],['Um comando militar permanente',{defesa:13,armas:7,legitimidade:-10,crueldade:7}]]},
  23:{title:'A GUARDA PEDE RENDIÇÃO',text:'Soldados aterrorizados retiram os elmos e entregam suas espadas. O cavaleiro exige um exemplo. O paladino, à distância, olha sem intervir.',options:[['Desarmar, alimentar e registrar testemunhos',{bencao:14,legitimidade:12,comida:-8,povo:4}],['Exibir os cativos como aviso à Alta',{pacto:16,crueldade:19,defesa:9,legitimidade:-14}]]},
  29:{title:'O OUTRO PREÇO DA VITÓRIA',text:'A influência demoníaca espalha a ideia de que a crueldade será uma nova ordem. Alguns moradores já temem tanto os rebeldes quanto os guardas.',options:[['Proibir punição sem julgamento e reparar abusos',{bencao:19,legitimidade:17,pacto:-7,comida:-8,crueldade:-14}],['Instituir tribunais de terror',{pacto:18,defesa:13,legitimidade:-19,crueldade:18}]]},
  35:{title:'A PROPOSTA DAS CASAS',text:'Nobres menores sugerem apoiar a revolta em troca de manter os antigos títulos e monopólios sobre o rio.',options:[['Recusar a compra da revolta',{legitimidade:16,esperanca:11,bencao:8,moeda:-12}],['Aceitar financiamento e privilégios',{moeda:42,armas:17,legitimidade:-17,crueldade:7}]]},
  40:{title:'DUAS SOMBRAS SOBRE O TRONO',text:'O paladino oferece proteção sem massacre; o cavaleiro promete rasgar a magia da Corte usando a mesma fome que alimenta a vingança. Nenhum deles pode governar a cidade por você.',options:[['Proclamar que a cidade pertence aos seus habitantes',{bencao:15,legitimidade:19,esperanca:8}],['Concentrar o poder na guarda revolucionária',{pacto:17,defesa:13,legitimidade:-9}]]}
 }
};
