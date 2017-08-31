# mj-server

<br/>
代码说明：<br/>
table_mgr.js, table.js, hulib.js, tbl/  这是麻将判胡的算法库，见 https://github.com/yuanfengyun/qipai
<br/>
<br/>
usermgr.js :  会员/游客<br/>
roommgr.js :  房间管理<br/>
algo_mj.js :  麻将处理，比如 摸牌，判断某个座位能否吃 。。。<br/>
<br/>
<br/>
手牌holds数组格式：　<br/>
[ 1, 2, 3, 33, 33, 33, 7, 8, 9, 32, 32, 32, 25 ]<br/>
<br/>
转换成BM格式的数据：<br/>
[  &nbsp; 0,0,0,0,0,0,0,0,0,<br/>
  &nbsp; 1,1,1,2,3,0,0,0,0,<br/>
  &nbsp; 0,0,0,2,2,2,0,0,0,<br/>
  &nbsp; 0,0,0,0,0,0,0 <br/>
]<br/>
<br/>
0 ~ 8 万<br/>
9 ~ 17 筒<br/>
18 ~ 26 条<br/>
27 ~ 34 风<br/>
