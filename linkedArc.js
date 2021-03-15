//Javascript Document
var dim; //the size of dimention of problem...
var doc; //Document size
var minObj=[],maxObj=[]; //min and max of Objectives
var intervals=[]; // The function who calculates and map the values on the arcs
var Data=[];
var selectingPoints=[];//for fram of selection
var sRect;//rectangle of selection
var linksCoord=[];//This array save the ID, start point and end point of each link
var selectedLinks=[];//This aray save the selected link wich are selected by selection frame.
var objNo;
function readData()
{
  d3.csv(fileName,function(error,data)
  {
    for(i=0;i<data.length;i++)
    {
      Data[i]=[+data[i].Obj1,+data[i].Obj2,+data[i].Obj3,+data[i].Obj4,+data[i].Obj5]//,+data[i].Obj6,//+data[i].Obj7];//,+data[i].Obj8,+data[i].Obj9,+data[i].Obj10,+data[i].Obj11,+data[i].Obj12,+data[i].Obj13,+data[i].Obj14,+data[i].Obj15,+data[i].Obj16,+data[i].Obj17,+data[i].Obj18,+data[i].Obj19,+data[i].Obj20];//,+data[i].Obj21,+data[i].Obj22,+data[i].Obj23,+data[i].Obj24,+data[i].Obj25,+data[i].Obj26,+data[i].Obj27,+data[i].Obj28,+data[i].Obj29,+data[i].Obj30,+data[i].Obj31,+data[i].Obj32,+data[i].Obj33,+data[i].Obj34,+data[i].Obj35,+data[i].Obj36,+data[i].Obj37,+data[i].Obj38,+data[i].Obj39,+data[i].Obj40,+data[i].Obj41,+data[i].Obj42,+data[i].Obj43,+data[i].Obj44,+data[i].Obj45,+data[i].Obj46,+data[i].Obj47,+data[i].Obj48,+data[i].Obj49,+data[i].Obj50];
      /*for(j=1;j<Object.keys(data[i]).length;j++)
      {
        objNo="Obj"+i.toString();
        Data[i].push(+data[i].objNo)
      }*/
    }

    Arcs();
  });
};

function Arcs()
{


  if(Data.length!=0)
  {
    dim=Data[0].length;
  }
  d3.select('form').select('fieldset')
                   .selectAll('g')
                   .data(Data[0])
                   .enter()
                   .append('input')
                   .attr('id',function(d,i){return 'Obj'+i.toString();})
                   .attr('type','text')
                   .attr('onfocus','focusText()')
                   .attr('value',function(d,i){return 'Objective '+i.toString()+' - Weight '+i.toString();});

  d3.select('form').select('fieldset')
                   .append('button')
                   .attr('type','button')
                   .attr('id','bSubmit')
                   .html('Calculate')
                   .attr('onclick','submitClick()');
  for(i=0;i<dim;i++)//finding the interval of each objective
  {
    var temp=Data.map(function(obj){ return obj[i]});
    minObj[i]=Math.min.apply(null,temp);
    maxObj[i]=Math.max.apply(null,temp);
      for(z=0;z<temp.length;z++)
      {
          Data[z][i] = (temp[z] - minObj[i]) / (maxObj[i] - minObj[i]);
      }
  }
  var min=0;//Math.min.apply(null,minObj);
  var max=1;//Math.max.apply(null,maxObj);
  var inR=(doc.clientHeight-50)/2; //Inner Radius
  var X=doc.clientWidth/2;
  var Y=doc.clientHeight/2;
  var usedEnv=360*70/100; //The usable Environment
  var unUsedEnv=(360-usedEnv)/dim; //The distance between arcs
  var arcAngle=usedEnv/dim; //The angle of each Arc
  var Angles=[];
  var arcs=[];

  for(i=0;i<dim;i++)
  {
    Angles[i]=[((i+1)*unUsedEnv)+(i*arcAngle),((i+1)*unUsedEnv)+((i+1)*arcAngle)];
    arcs[i]=d3.svg.arc()
                  .innerRadius(inR)
                  .outerRadius(inR+8)
                  .startAngle(Angles[i][0]*(Math.PI/180))
                  .endAngle(Angles[i][1]*(Math.PI/180));
  }

  var arcPaths=d3.select('#mainSVG').selectAll('.arcPath')
                                    .data(arcs)
                                    .enter()
                                    .append('path')
                                    .attr('class','arcPath')
                                    .attr('id',function(d,i)
                                    {
                                      return 'obj'+i.toString();
                                    })
                                    .attr('d',function(d,i)
                                    {
                                      return arcs[i]();
                                    })
                                    .attr('fill','red')
                                    .attr('transform','translate('+X+','+Y+')')
                                    .on('mouseover',function(d,i)
                                    {
                                      var idx=i;
                                      d3.selectAll('.arcPath').attr('opacity',0.2);
                                      var links=d3.selectAll('.link');
                                      d3.select(this).attr('opacity',1);
                                      links[0].forEach(function(d,i)
                                      {
                                        if((d.id).search(idx)!=-1)
                                        {
                                          d3.selectAll('#'+d.id).attr('class','linkOnObj');
                                        }
                                      })
                                    })
                                    .on('mouseout',function(d,i)
                                    {
                                      mainSVG.selectAll('.arcPath').attr('opacity',1);
                                      mainSVG.selectAll('.linkOnObj').attr('class','link');
                                    });

    //map the objectives' interval on the arcs
  var tempPath=[];
  for(i=0;i<arcPaths[0].length;i++)
  {
    tempPath[i]=d3.select(arcPaths[0][i]).node();
    //intervals[i]=d3.scale.linear().domain([0,20]).range([0,tempPath[i].getTotalLength()]);
  }
  var a=d3.select()
  intervals=d3.scale.linear().domain([0,max]).range([0,d3.select('.arcPath').node().getTotalLength()/2]);

  //finding the point on the arcs
  var normVal=[];//finding the normal value of each items on the path befor calculating of coordinate
  var Points=[];//The Points of each value on the Arcs.
  for(i=0;i<Data.length;i++)
  {
    normVal[i]=new Array(dim);
    Points[i]=new Array(dim);
    for(j=0;j<dim;j++)
    {
      normVal[i][j]=intervals(Data[i][j]);
      Points[i][j]=tempPath[j].getPointAtLength(normVal[i][j]);
      Points[i][j].x+=X;
      Points[i][j].y+=Y;
    }
  }

  //Drawing Connections
  var connections=[];
  var lineFunc=d3.svg.line()
                     .x(function(d){return d.x;})
                     .y(function(d){return d.y;})
                     .interpolate('bundle')
                     .tension(0.4);
  var rep=(dim*(dim-1))/2; //number of connection group based on number of objectives
  var tempPoint=[];
  for(j1=0;j1<dim;j1++)
  {
    for(j2=j1+1;j2<dim;j2++)
    {
      for(i=0;i<Points.length;i++)
      {

        tempPoint[i]=new Array(3);
        tempPoint[i][0]=Points[i][j1];
        tempPoint[i][1]={x:X,y:Y};//For making Curve in bundle interpolation
        tempPoint[i][2]=Points[i][j2];

        d3.select('#mainSVG').append('path')
                           .attr('class','link')
                           .attr('id',function(d,idx)
                           {

                             return 'link'+j1.toString()+"-"+j2.toString()+"-idx"+i.toString();
                           })
                           .attr('d',lineFunc(tempPoint[i]))
                           .on('mouseover',function(d,idx)
                           {
                             var coordinate=d3.mouse(this);
                             d3.select(this).attr('class','linkOver');
                             d3.selectAll('.link').attr('class','linkNoOver');
                             //make tooltip
                             var info=[]; //The information of each link
                             var idText=d3.select(this).attr('id');
                             var O1=+idText[4];
                             var O2=+idText[6];
                             info[0]=Data[+idText.substr(11)][O1];
                             info[1]=Data[+idText.substr(11)][O2];
                             makeTooltip(info,O1,O2,coordinate)

                           })
                           .on('mouseout',function(d,idx)
                           {
                             d3.select(this).attr('class','link');
                             d3.selectAll('.linkNoOver').attr('class','link');
                             d3.selectAll('.tooltip').remove();
                           });
      }

    }
  }

  //Make the lables on the Arcs
  var lablePos=[]; //Position of lables on arcs
  for(i=0;i<tempPath.length;i++)
  {
    lablePos[i]=[tempPath[i].getPointAtLength(0),tempPath[i].getPointAtLength(tempPath[i].getTotalLength()/2)];
    lablePos[i][0].x+=X;
    lablePos[i][0].y+=Y;
    lablePos[i][1].x+=X;
    lablePos[i][1].y+=Y;
    d3.select('#mainSVG').selectAll('#arcLable'+i.toString())
                       .data(lablePos[i])
                       .enter()
                       .append('text')
                       .attr('id','arcLable'+i.toString())
                       .attr('x',function(d,idx)
                       {
                         return d.x;
                       })
                       .attr('y',function(d)
                       {
                         return d.y;
                       })
                       .attr('font-size',18)
                       .text(function(d,idx)
                       {
                         if(idx==0)
                          return min.toString()+"     Obj"+i;
                         else
                          return max.toString();
                       });

  }

  var tempLinks=mainSVG.selectAll('.link');
  for(i=0;i<tempLinks[0].length;i++)
  {
    linksCoord[i]=new Array(3);
    linksCoord[i][0]=tempLinks[0][i].id;
    linksCoord[i][1]=tempLinks[0][i].getPointAtLength(0);
    linksCoord[i][2]=tempLinks[0][i].getPointAtLength(tempLinks[0][i].getTotalLength());
  }


};


function makeTooltip(info,O1,O2,coordinate)
{
  var toolTipSVG=d3.select('#mainSVG').append('svg')
                       .attr('class','tooltip')
                       .attr('width',220)
                       .attr('height',75)
                       .attr('x',coordinate[0]+15)
                       .attr('y',coordinate[1]-20);
  toolTipSVG.append('rect')
            .attr('width',220)
            .attr('height',75)
            .attr('x',0)
            .attr('y',0)
            .attr('stroke','black')
            .attr('stroke-width',2)
            .attr('stroke-opacity',0.8)
            .attr('opacity',0.9)
            .attr('fill','#7CFF8A');

  var toolText=toolTipSVG.append('text')
                       .attr('class','tooltipTitle')
                       .attr('x',10)
                       .attr('y',20)
                       .text('This link connects:');

  var info1=['Objective '+(O1+1).toString()+': ',
              info[0],
              'Objective '+(O2+1).toString()+': ',
              info[1]];
  toolText.selectAll('tspan')
                       .data(info1)
                       .enter()
                       .append('tspan')
                       .attr('class',function(d,idx)
                       {
                          if(idx==0 || idx==2)
                            return 'tooltipTitle';
                          else
                            return 'tooltipVal';
                       })
                       .attr('dy',function(d,idx)
                       {
                          if(idx==0 || idx==2)
                            return 20;
                          else
                            return 0;
                       })
                       .attr('x',20)
                       .attr('dx',function(d,idx)
                       {
                          if(idx==0 || idx==2)
                            return 0;
                          else
                            return 82;
                       })
                       .text(function(d,idx)
                        {
                          return info1[idx];
                        });
};




function mouseDown()
{
  selectingPoints[0]=d3.mouse(this);
  mainSVG.selectAll('.link').attr('class','unSelectedLink');
  sRect=d3.select('#mainSVG').append('rect')
                             .attr('x',selectingPoints[0][0])
                             .attr('y',selectingPoints[0][1])
                             .attr('width',0)
                             .attr('height',0)
                             .attr('class','selectionFrame');

  d3.select('#mainSVG').on('mousemove',mouseMove);
};
function mouseUp()
{
  mainSVG.on('mousemove',null);
  mainSVG.selectAll('rect').remove();
};

function mouseMove()
{
    mainSVG.selectAll('.link').attr('class','unSelectedLink');
    selectingPoints[1]=d3.mouse(this);
    var sX,sY;
    var w=Math.abs(selectingPoints[1][0]-selectingPoints[0][0]);
    var h=Math.abs(selectingPoints[1][1]-selectingPoints[0][1]);
    sRect.attr('x',function(d)
                   {
                     if(selectingPoints[0][0]<=selectingPoints[1][0])
                     {
                        sX=selectingPoints[0][0];
                        return sX;
                     }
                     else
                     {
                        sX=selectingPoints[1][0];
                        return sX;
                     }
                   })
         .attr('y',function(d)
                   {
                     if(selectingPoints[0][1]<=selectingPoints[1][1])
                     {
                        sY=selectingPoints[0][1];
                        return sY;
                     }
                     else
                     {
                        sY=selectingPoints[1][1];
                        return sY;
                     }
                   })
         .attr('width',w)
         .attr('height',h);

    function selectLink(value,idx,arr)
    {
      if(value[1].x>sX && value[1].x<sX+w && value[1].y>sY && value[1].y<sY+h)
      {
        return true;
      }
      if(value[2].x>sX && value[2].x<sX+w && value[2].y>sY && value[2].y<sY+h)
      {
        return true;
      }
      return false;
    };
    selectedLinks=linksCoord.filter(selectLink);
    //d3.selectAll('.link').attr('stroke','blue');
    for(i=0;i<selectedLinks.length;i++)
    {
      mainSVG.select('#'+selectedLinks[i][0]).attr('class','selectedLink');
        d3.selectAll('.selectedLink').moveToFront();
    }
    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
        });
    };
    d3.selection.prototype.moveToBack = function() {
        return this.each(function() {
            var firstChild = this.parentNode.firstChild;
            if (firstChild) {
                this.parentNode.insertBefore(this, firstChild);
            }
        });
    };
};

function Reset()
{
  mainSVG.selectAll('.unSelectedLink').attr('class','link');
  mainSVG.selectAll('.selectedLink').attr('class','link');
  mainSVG.selectAll('.coloredLink').attr('class','link');
}

function focusText(id)
{
  document.activeElement.value=null;
}

function submitClick()
{
  d3.selectAll('.coloredLink').attr('class','link')
  var weights=[],goals=[],max=[],v;
  var inputs=d3.select('form').selectAll('input');
  for(i=0;i<inputs[0].length;i++)
  {
    var tempO=inputs[0][i].value.slice(0,inputs[0][i].value.indexOf('-'));
    var temp1=inputs[0][i].value.slice(inputs[0][i].value.indexOf('-')+1,inputs[0][i].value.length);
    if(!isNaN(parseFloat(tempO)) && !isNaN(parseFloat(temp1)))
    {
      goals[i]=parseFloat(tempO);
      weights[i]=parseFloat(temp1);
    }
    else
    {
      d3.select('#'+inputs[0][i].id).style('background-color','yellow').attr('value','Enter Standard Value');
    }
  }

  var links=mainSVG.selectAll('.link');
  var colored=Vikor(goals,maxObj,weights,0.9);

  //Painting Links

  for(i=0;i<links[0].length;i++)
  {
    d3.select('#'+links[0][i].id).attr('class','coloredLink').attr('stroke',function(){
                                                    var idx=links[0][i].id;
                                                    idx=+(idx.slice(idx.indexOf('x')+1,idx.length));
                                                    return colored[idx];
                                                 });
  }
}

function Vikor(goal,max,w,V)
{

  var normaled=[];// The normaled datas
  for(i=0;i<Data.length;i++)
  {
    normaled[i]=new Array(3);
  }

  //Normalizing
  for(j=0;j<dim;j++)//The column
  {
    var sum=0;
    for(i=0;i<Data.length;i++)//sumation of each column
    {
      sum=sum+(Math.pow(Data[i][j],2));
    }
    for(i=0;i<Data.length;i++)
    {
      normaled[i][j]=Data[i][j]/Math.sqrt(sum);
    }
  }

  //Calculate the distance to the goal
  var ss=0,rr=[];
  var S=[],R=[];
  for(i=0;i<normaled.length;i++)
  {
    ss=0;
    for(j=0;j<normaled[0].length;j++)
    {
      ss=ss+(w[j]*((goal[j]-normaled[i][j])/(goal[j]-max[j])));
      rr[j]=w[j]*(goal[j]-normaled[i][j])/(goal[j]-max[j]);
    }
    S[i]=ss;
    R[i]=Math.max.apply(null,rr);
  }
  var Smax=Math.max.apply(null,S);
  var Smin=Math.min.apply(null,S);
  var Rmax=Math.max.apply(null,R);
  var Rmin=Math.min.apply(null,R);
  var Q=[];//The ranked point. It means the less distance is the best
  for(i=0;i<S.length;i++)
  {
    Q[i]=(V*(Smin-S[i])/(Smin-Smax))+((1-V)*(Rmin-R[i])/(Rmin-Rmax));
  }
  var Q1=[];
  for(i=0;i<Q.length;i++)
  {
    Q1[i]=Q[i];
  }
  var sorted=Q1.sort(function(a,b){return b-a;});
  var ranked=Q.map(function(v){ return sorted.indexOf(v)+1;});
  var colors=d3.scale.quantize().domain([1,Math.max.apply(null,ranked)]).range(['#FF381B','#FF5A1B','#FF7C1B','#FF9A1B','#FFB51B','#FFCF1B']);
  var trans=d3.scale.linear().domain([1,Math.max.apply(null,ranked)]).range([1,0]);
  var colored=[];//save the color of each solution
  for(i=0;i<Q.length;i++)
  {
    colored[i]=colors(ranked[i]);
  }

  return colored;


}
