var tmpl;
// get html template
$.get('thumbnail.html', function(data){
  tmpl = data;
});

var $listRoot = $('.page-list');


// 設定 Facebook AppID
window.fbAsyncInit = function() {
    FB.init({
        appId: '1502823243335677', // 若可以，請換成自己的 App ID !
        xfbml: true,
        version: 'v2.2'
    });

    $('#startBtn').click(function(e){
      //清空結果
      $($listRoot).empty();
      $('#moreBtn').addClass('hide');
      // 臉書登入SDK
      FB.login(function(response) {
        if(response.authResponse) {
            //讀取個人信息
            FB.api( '/me?fields=name,picture,likes.limit(60)', function(response){
              // 把資訊插入到html裡，並顯示出來
              $('.user-name').text(response.name);
              $('.user-photo').attr('src',response.picture.data.url);
              $('#user').removeClass('hide');
              // ---------------
              // 讀取 like 的列表，並儲存到 likes, 以及下一組資料的連結到 next
              var likes = response.likes.data;  //this is a array
              var next = response.likes.paging.next;
              //把讀到的資料放進html
              loadPagesInfo(likes);
              // save next request url to moreBtn and show it
              $('#moreBtn').data('next',next).removeClass('hide');
            });
        }else{
            console.log('User cancelled login or did not fully authorize.');
        }
      }, {scope: 'user_likes'});//拿使用者喜歡的專頁權限
      e.preventDefault();
    });

    $('#moreBtn').click(function(e){
      $.getJSON( $(this).data('next'), function(response){
        //更新列表資料
        loadPagesInfo(response.data);
      })
      e.preventDefault();
    });
};



// load each pages info and insert to html
var loadPagesInfo = function(pages){

  var counter = 0, //計算現在讀完資料沒
      current = $('<div class="current"></div>').appendTo($listRoot); //定位當前的資料

  pages.forEach(function(item, index){
    //從 template 塞資料
    var $page = $(tmpl).clone();  //copy 
    FB.api(item.id, function(response){
      // 塞 name, about, like 數到 html 裡。
      $page.find('.title a').text(response.name).attr('href',response.link); //put name in title
      $page.find('.about').text(response.about);  //  put description in about
      $page.find('.likes').text(response.likes);
      FB.api(item.id+'/picture?type=large'/*輸入圖片連結*/, function(response){  //find專頁的資料的API
        // 塞資料到 html 中
        $page.find('.thumbnail img').attr('src',response.data.url);
        counter++;
        $page.appendTo(current);
        // 塞完資料以後處理一下斷行
        if(counter===pages.length){ //counter是為了確認塞完資料以便於知道何時插入換行的div
          // 利用 .current div:nth-child(3n)，讓每三個page 斷行
          $('.current div:nth-child(3n)').after('<div class="clearfix"></div>');
          current.children('div').unwrap();
        }
      });
    });
  });
};
