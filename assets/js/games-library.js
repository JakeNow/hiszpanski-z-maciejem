'use strict';
document.addEventListener('DOMContentLoaded', () => {
  const grid=document.getElementById('games-grid');
  const search=document.getElementById('search');
  const level=document.getElementById('level');
  const topic=document.getElementById('topic');
  const kind=document.getElementById('game-type');
  const count=document.getElementById('game-count');
  const empty=document.getElementById('game-empty');
  const names={crossword:'Krzyżówka',wordsearch:'Wykreślanka',gaps:'Uzupełnianie luk'};
  const topics={slownictwo:'Słownictwo',gramatyka:'Gramatyka',konwersacje:'Konwersacje'};
  const add=(tag,className,text)=>{
    const element=document.createElement(tag);
    if(className)element.className=className;
    if(text!==undefined)element.textContent=text;
    return element;
  };
  function render(){
    const query=search.value.trim().toLocaleLowerCase('pl');
    const games=(window.INTERACTIVE_GAMES||[]).filter(g=>
      (!level.value||g.level===level.value)&&
      (!topic.value||g.topic===topic.value)&&
      (!kind.value||g.type===kind.value)&&
      (!query||[g.title,g.desc,g.level,names[g.type],topics[g.topic]].join(' ').toLocaleLowerCase('pl').includes(query))
    );
    grid.replaceChildren();
    for(const g of games){
      const article=add('article','material-card');
      article.append(
        add('span','chip',g.level+' · '+names[g.type]),
        add('h3','',g.title),
        add('p','',g.desc)
      );
      const details=g.type==='crossword'?g.entries.length+' haseł':
        g.type==='wordsearch'?g.words.length+' ukrytych słów':
        g.paragraphs.reduce((n,p)=>n+p.gaps.length,0)+' luk';
      article.append(add('span','small',topics[g.topic]+' · '+details));
      const link=add('a','',g.type==='crossword'?'Rozwiąż krzyżówkę →':
        g.type==='wordsearch'?'Zagraj w wykreślankę →':'Uzupełnij luki →');
      link.href='gra.html?id='+encodeURIComponent(g.id);
      article.append(link);
      grid.append(article);
    }
    count.textContent='Gry i ćwiczenia: '+games.length;
    empty.hidden=games.length!==0;
  }
  for(const filter of [search,level,topic,kind])filter.addEventListener('input',render);
  render();
});
