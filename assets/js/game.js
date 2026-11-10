'use strict';
document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const id = new URLSearchParams(window.location.search).get('id');
  const game = (window.INTERACTIVE_GAMES || []).find(item => item.id === id);
  if (!game) {
    $('game-title').textContent = 'Nie znaleziono ćwiczenia';
    $('game-desc').textContent = 'Wróć do biblioteki i wybierz dostępną grę.';
    return;
  }
  const modeNames = {crossword:'Krzyżówka', wordsearch:'Wykreślanka', gaps:'Uzupełnianie luk'};
  const root = $('game-content');
  const status = $('game-status');
  const normal = text => String(text || '').trim().normalize('NFC').toLocaleUpperCase('es').replace(/\s+/g, ' ');
  const node = (tag, className, text) => {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  };
  const button = (label, callback, className='btn') => {
    const el = node('button', className, label);
    el.type = 'button';
    el.addEventListener('click', callback);
    return el;
  };
  const tools = () => {
    const section = node('div','game-actions');
    root.append(section);
    return section;
  };
  const report = value => { status.textContent = value; };

  // Klawiatura ekranowa do ćwiczeń wymagających wpisywania hiszpańskich znaków.
  // Akcenty są wstawiane do ostatnio wybranego pola, bez utraty pozycji kursora.
  const makeAccentBar = (target, crossword=false) => {
    const panel = node('div','spanish-keyboard');
    panel.setAttribute('role','group');
    panel.setAttribute('aria-label','Przyciski do wpisywania hiszpańskich znaków');
    panel.append(node('span','spanish-keyboard-label','Hiszpańskie znaki:'));
    const chars = crossword ? ['á','é','í','ó','ú','ü','ñ'] :
      ['á','é','í','ó','ú','ü','ñ','¿','¡'];
    for (const char of chars) {
      const key = button(char, () => {
        const input = target();
        if (!input) {
          report(crossword
            ? 'Kliknij najpierw kratkę krzyżówki, a potem wybierz znak.'
            : 'Kliknij najpierw lukę w tekście, a potem wybierz znak.');
          return;
        }
        const start = typeof input.selectionStart === 'number' ?
          input.selectionStart : input.value.length;
        const end = typeof input.selectionEnd === 'number' ?
          input.selectionEnd : start;
        input.focus();
        if (crossword) {
          // W krzyżówce jedno pole odpowiada jednej literze.
          input.value = char.toLocaleUpperCase('es');
        } else if (typeof input.setRangeText === 'function') {
          input.setRangeText(char, start, end, 'end');
        } else {
          input.value = input.value.slice(0,start) + char + input.value.slice(end);
        }
        input.dispatchEvent(new Event('input',{bubbles:true}));
      },'spanish-key');
      key.setAttribute('aria-label','Wstaw znak '+char);
      key.title='Wstaw '+char;
      panel.append(key);
    }
    return panel;
  };
  document.title = game.title + ' | RONDA — Szkoła Językowa';
  $('game-label').textContent = game.level + ' / ' + modeNames[game.type];
  $('game-title').textContent = game.title;
  $('game-desc').textContent = game.desc;

  function renderCrossword() {
    const entries = game.entries.map((e,i) => ({...e,letters:Array.from(normal(e.word)),index:i}));
    const positions = new Map();
    for (const entry of entries) {
      entry.keys = entry.letters.map((letter,i) => {
        const r = entry.row+(entry.dir==='down'?i:0);
        const c = entry.col+(entry.dir==='across'?i:0);
        const key = r+','+c;
        if (positions.has(key) && positions.get(key).letter!==letter) throw Error('Nieprawidłowe przecięcie haseł');
        if (!positions.has(key)) positions.set(key,{r,c,letter,entries:[]});
        positions.get(key).entries.push(entry.index);
        return key;
      });
    }
    const cols = 1+Math.max(...Array.from(positions.values(),v=>v.c));
    const rows = 1+Math.max(...Array.from(positions.values(),v=>v.r));
    const starts = [...new Set(entries.map(e=>e.row+','+e.col))]
      .sort((a,b)=>{const [ar,ac]=a.split(',').map(Number),[br,bc]=b.split(',').map(Number);return ar-br||ac-bc;});
    const numbers = new Map(starts.map((key,i)=>[key,i+1]));
    const heading = node('p','game-instruction','Kliknij hasło poziome lub pionowe i wpisuj litery w kratkach. Przecięcia uzupełniają się automatycznie. Do wpisywania liter z akcentami i ñ możesz użyć przycisków nad planszą.');
    root.append(heading);
    root.append(makeAccentBar(() => focusedCrossword, true));
    const scroll = node('div','game-grid-scroll');
    scroll.tabIndex = 0;
    scroll.setAttribute('aria-label','Krzyżówka — można przewijać poziomo');
    const grid = node('div','cross-grid');
    grid.style.setProperty('--cols',cols);
    grid.setAttribute('role','group');
    grid.setAttribute('aria-label','Krzyżówka');
    scroll.append(grid);
    root.append(scroll);
    const cells = new Map();
    let active = 0;
    let focusedCrossword = null;
    const clueButtons = new Map();
    const highlight = () => {
      for (const {wrap} of cells.values()) wrap.classList.remove('active');
      entries[active].keys.forEach(key => cells.get(key).wrap.classList.add('active'));
      clueButtons.forEach((btn,i) => btn.setAttribute('aria-pressed',String(i===active)));
    };
    const focusAt = (key) => {
      const cell = cells.get(key);
      if (cell) {cell.input.focus();cell.input.select();}
    };
    const advance = (key, direction) => {
      const e = entries[active];
      const n = e.keys.indexOf(key);
      if (n>=0) focusAt(e.keys[Math.min(e.keys.length-1,Math.max(0,n+direction))]);
    };
    for (let r=0;r<rows;r++) for(let c=0;c<cols;c++) {
      const key=r+','+c;
      const wrap=node('div','cross-cell'+(positions.has(key)?'':' blocked'));
      if (positions.has(key)) {
        if (numbers.has(key)) wrap.append(node('span','cross-num',String(numbers.get(key))));
        const input=node('input','cross-letter');
        input.type='text';input.maxLength=2;input.autocomplete='off';
        input.autocapitalize='characters';input.spellcheck=false;input.inputMode='text';
        input.setAttribute('aria-label','Wiersz '+(r+1)+', kolumna '+(c+1));
        wrap.append(input);
        cells.set(key,{wrap,input});
        input.addEventListener('focus',() => {
          focusedCrossword = input;
          if (!entries[active].keys.includes(key)) active=positions.get(key).entries[0];
          highlight();
        });
        input.addEventListener('input',() => {
          const char=Array.from(normal(input.value)).filter(x=>/^[A-ZÁÉÍÓÚÜÑ]$/.test(x)).slice(0,1).join('');
          input.value=char;
          wrap.classList.remove('incorrect');
          report('');
          if(char) advance(key,1);
        });
        input.addEventListener('keydown',(event)=>{
          if(event.key==='Backspace'&&!input.value){event.preventDefault();advance(key,-1);}
          else if(event.key==='Enter'){event.preventDefault();advance(key,1);}
          else if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)){
            event.preventDefault();
            const offsets={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]};
            const [dr,dc]=offsets[event.key];
            focusAt((r+dr)+','+(c+dc));
          }
        });
      }
      grid.append(wrap);
    }
    const clueWrap=node('div','cross-clues');
    for(const dir of ['across','down']){
      const panel=node('section','cross-clue-panel');
      panel.append(node('h3','',dir==='across'?'Poziomo':'Pionowo'));
      for(const e of entries.filter(e=>e.dir===dir).sort((a,b)=>numbers.get(a.keys[0])-numbers.get(b.keys[0]))) {
        const label=numbers.get(e.keys[0])+'. '+e.clue+' ('+e.letters.length+' liter)';
        const btn=button(label,()=>{
          active=e.index;highlight();
          focusAt(e.keys.find(key=>!cells.get(key).input.value)||e.keys[0]);
        },'cross-clue');
        clueButtons.set(e.index,btn);
        panel.append(btn);
      }
      clueWrap.append(panel);
    }
    root.append(clueWrap);
    const actions=tools();
    actions.append(
      button('Sprawdź hasła',()=>{
        let correct=0;
        for(const e of entries)if(e.keys.every((key,i)=>normal(cells.get(key).input.value)===e.letters[i]))correct++;
        for(const [key,cell] of cells) cell.wrap.classList.toggle('incorrect',normal(cell.input.value)!==positions.get(key).letter);
        report('Poprawne hasła: '+correct+' / '+entries.length+'. '+(correct===entries.length?'Brawo! Wszystkie hasła są poprawne.':'Zaznaczone kratki wymagają poprawy.'));
      }),
      button('Podpowiedz literę',()=>{
        const e=entries[active];
        const key=e.keys.find((key,i)=>normal(cells.get(key).input.value)!==e.letters[i]);
        if(!key){report('To hasło jest już poprawnie uzupełnione.');return;}
        const idx=e.keys.indexOf(key);
        cells.get(key).input.value=e.letters[idx];
        cells.get(key).wrap.classList.remove('incorrect');
        focusAt(key);
        report('Odkryto jedną literę aktywnego hasła.');
      },'btn btn-line'),
      button('Pokaż rozwiązanie',()=>{
        for(const [key,cell] of cells){cell.input.value=positions.get(key).letter;cell.wrap.classList.remove('incorrect');}
        report('Pokazano wszystkie odpowiedzi. Możesz wyczyścić planszę i spróbować ponownie.');
      },'btn btn-line'),
      button('Wyczyść',()=>{
        for(const cell of cells.values()){cell.input.value='';cell.wrap.classList.remove('incorrect');}
        active=0;highlight();report('Plansza wyczyszczona.');
      },'btn btn-line')
    );
    highlight();
  }

  function renderWordsearch() {
    const board=game.grid.map(row=>Array.from(row));
    const height=board.length, width=board[0].length;
    root.append(node('p','game-instruction','Znajdź słowa z listy. Kliknij pierwszą i ostatnią literę słowa w linii prostej — poziomo, pionowo lub na ukos. Możesz zaznaczać także od końca.'));
    const scroll=node('div','game-grid-scroll');
    scroll.tabIndex=0;
    scroll.setAttribute('aria-label','Wykreślanka — można przewijać poziomo');
    const grid=node('div','search-grid');
    grid.style.setProperty('--cols',width);
    const cells=new Map();
    let start=null;
    const found=new Map();
    const words=node('ul','search-words');
    const labels=new Map();
    const key=(r,c)=>r+','+c;
    function refresh(){
      const used=new Set(Array.from(found.values()).flatMap(coords=>coords.map(([r,c])=>key(r,c))));
      for(const [pos,button] of cells){
        button.classList.toggle('found',used.has(pos));
        button.classList.toggle('chosen',start!==null&&key(...start)===pos);
        button.setAttribute('aria-pressed',String(start!==null&&key(...start)===pos));
      }
      for(const [word,item] of labels){item.classList.toggle('word-found',found.has(word));}
      $('game-progress').textContent='Znalezione: '+found.size+' / '+game.words.length;
    }
    function choose(r,c){
      if(!start){start=[r,c];report('Teraz wybierz ostatnią literę słowa.');refresh();return;}
      const [r0,c0]=start;
      start=null;
      const dr=r-r0,dc=c-c0;
      if(!dr&&!dc){report('Wybierz dwie różne kratki.');refresh();return;}
      if(dr!==0&&dc!==0&&Math.abs(dr)!==Math.abs(dc)){
        report('Wybierz koniec słowa w tym samym wierszu, kolumnie lub na przekątnej.');refresh();return;
      }
      const count=Math.max(Math.abs(dr),Math.abs(dc))+1;
      const stepR=Math.sign(dr),stepC=Math.sign(dc);
      const coords=Array.from({length:count},(_,i)=>[r0+i*stepR,c0+i*stepC]);
      const text=coords.map(([rr,cc])=>board[rr][cc]).join('');
      const match=game.words.find(w=>!found.has(w)&&(text===w||Array.from(text).reverse().join('')===w));
      if(match){found.set(match,coords);report('Znaleziono: '+match+'.'+(found.size===game.words.length?' Gratulacje — wszystkie słowa odnalezione!':''));}
      else report('To nie jest żadne z nieodkrytych słów. Spróbuj ponownie.');
      refresh();
    }
    for(let r=0;r<height;r++)for(let c=0;c<width;c++){
      const btn=button(board[r][c],()=>choose(r,c),'search-cell');
      btn.setAttribute('aria-label','Wiersz '+(r+1)+', kolumna '+(c+1)+', litera '+board[r][c]);
      btn.setAttribute('aria-pressed','false');
      cells.set(key(r,c),btn);
      grid.append(btn);
    }
    scroll.append(grid);root.append(scroll);
    const progress=node('p','game-progress');
    progress.id='game-progress';progress.setAttribute('role','status');
    root.append(progress);
    for(const word of game.words){
      const item=node('li','',word);
      item.lang='es';labels.set(word,item);words.append(item);
    }
    root.append(words);
    const actions=tools();
    actions.append(button('Podpowiedz położenie',()=>{
      const word=game.words.find(w=>!found.has(w));
      if(!word){report('Wszystkie słowa zostały już znalezione.');return;}
      const directions=[[0,1],[1,0],[1,1],[1,-1],[0,-1],[-1,0],[-1,-1],[-1,1]];
      for(let r=0;r<height;r++)for(let c=0;c<width;c++)for(const [dr,dc] of directions){
        if(Array.from(word).every((letter,i)=>board[r+dr*i]?.[c+dc*i]===letter)){
          report('Podpowiedź: „'+word+'” zaczyna się w wierszu '+(r+1)+', kolumnie '+(c+1)+'.');return;
        }
      }
    },'btn btn-line'),button('Zacznij od nowa',()=>{
      start=null;found.clear();refresh();report('Plansza została zresetowana.');
    },'btn btn-line'));
    refresh();
  }

  function renderGaps() {
    root.append(node('p','game-instruction','Wpisz brakujące słowa w hiszpańskim tekście. Korzystaj ze wskazówek przy lukach. Akcenty (á, é, í, ó, ú) i litera ñ mają znaczenie przy sprawdzaniu. Przyciski poniżej pomogą Ci je wpisać.'));
    const all=[];
    let focused=null;
    root.append(makeAccentBar(() => focused));
    for(const paragraph of game.paragraphs){
      const p=node('p','gap-paragraph');
      paragraph.gaps.forEach((gap,i)=>{
        p.append(document.createTextNode(paragraph.parts[i]));
        const label=node('label','gap-inline');
        const input=node('input','gap-input');
        const index=all.length;
        input.type='text';input.autocomplete='off';input.spellcheck=false;
        input.lang='es';input.maxLength=32;
        input.style.setProperty('--gap-width',Math.max(7,Math.min(17,gap.answer.length+2)));
        input.setAttribute('aria-label','Luka '+(index+1)+'. Wskazówka: '+gap.hint);
        input.placeholder=String(index+1);
        input.addEventListener('focus',()=>{focused=input;});
        input.addEventListener('input',()=>{input.classList.remove('gap-correct','gap-wrong');report('');});
        const hint=node('small','gap-hint','('+gap.hint+')');
        label.append(input,hint);p.append(label);
        all.push({input,gap});
      });
      p.append(document.createTextNode(paragraph.parts.at(-1)));
      root.append(p);
    }
    if(game.wordBank?.length){
      const bank=node('div','gap-bank');
      bank.append(node('h3','','Bank słów — kliknij, aby wstawić słowo'));
      const list=node('div','gap-bank-list');
      for(const word of game.wordBank){
        list.append(button(word,()=>{
          const input=(focused&&!focused.value.trim()?focused:null)||all.find(x=>!x.input.value.trim())?.input||focused;
          if(!input){report('Wszystkie luki są już wypełnione.');return;}
          input.value=word;input.classList.remove('gap-correct','gap-wrong');input.focus();report('Wstawiono: '+word+'.');
        },'gap-bank-button'));
      }
      bank.append(list);
      root.prepend(bank);
    }
    const feedback=node('ol','gap-feedback');
    feedback.setAttribute('aria-live','polite');
    const actions=tools();
    actions.append(button('Sprawdź odpowiedzi',()=>{
      let score=0;
      feedback.replaceChildren();
      all.forEach(({input,gap},i)=>{
        const accepted=Array.isArray(gap.answer)?gap.answer:[gap.answer];
        const ok=accepted.some(answer=>normal(input.value)===normal(answer));
        if(ok)score++;
        input.classList.toggle('gap-correct',ok);
        input.classList.toggle('gap-wrong',!ok);
        const msg=ok?'Poprawnie.':'Sprawdź ponownie. Wskazówka: '+gap.hint+'.'+
          ((input.value&&!/[ÁÉÍÓÚÑÜ]/.test(normal(input.value))&&/[ÁÉÍÓÚÑÜ]/.test(normal(accepted[0])))?' Pamiętaj o akcentach.':'');
        feedback.append(node('li',ok?'feedback-ok':'feedback-error','Luka '+(i+1)+': '+msg));
      });
      report('Twój wynik: '+score+' / '+all.length+'. '+(score===all.length?'¡Muy bien! Wszystkie odpowiedzi są poprawne.':'Popraw zaznaczone pola i sprawdź ponownie.'));
    }),button('Pokaż rozwiązania',()=>{
      for(const {input,gap} of all){
        input.value=Array.isArray(gap.answer)?gap.answer[0]:gap.answer;
        input.classList.remove('gap-wrong');input.classList.add('gap-correct');
      }
      feedback.replaceChildren();
      report('Pokazano poprawne odpowiedzi. Możesz je wyczyścić i spróbować samodzielnie.');
    },'btn btn-line'),button('Wyczyść',()=>{
      for(const {input} of all){input.value='';input.classList.remove('gap-wrong','gap-correct');}
      focused=null;feedback.replaceChildren();report('Wszystkie luki wyczyszczone.');
    },'btn btn-line'));
    root.append(feedback);
  }
  if(game.type==='crossword')renderCrossword();
  else if(game.type==='wordsearch')renderWordsearch();
  else if(game.type==='gaps')renderGaps();
  else report('Nieobsługiwany rodzaj ćwiczenia.');
});
