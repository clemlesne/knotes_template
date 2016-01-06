'use strict';

var $body = $('body'),
$menu = $('#menu');

// https://iamceege.github.io/tooltipster/
$('.tooltip').tooltipster({
  theme: 'tooltip',
  animation: 'fade',
  delay: 200,
  touchDevices: true,
  trigger: 'hover',
  maxWidth: 220
});

$menu.panel({
  breakpoints: 'medium',
  hidden: true,
  animation: 'overlayX',
  side: 'right',
  resetForms: false,
  resetScroll: false,
  target: $body,
  delay: 500,
  visibleClass: 'is-menu-visible'
});

$('.table--link tr').on({
  click: function(e) {
    if($(e.target).is("a, input")) return;
    var href = $(this).find('a').attr('href');
    if(typeof href != 'undefined') location.href = $(this).find('a').attr('href');

  }, mouseenter: function(e) {
    if($(e.target).is("a, input")) return;
    var href = $(this).find('a').attr('href');
    if(typeof href != 'undefined') $(this).addClass('table--link--hover');

  }, mouseleave: function(e) {
    if($(e.target).is("a, input")) return;
    $(this).removeClass('table--link--hover');
  }
});

if(isPage('notes')) {

  var tempNid = null;
  $('.notes__delete').click(function() {
    tempNid = $(this).attr('data-nid');
    console.log("tempNid > " + tempNid);
  });

  $(document).on('closed', '.notes__modal__delete', function (e) {
    tempNid = null;
  });

  $(document).on('confirmation', '.notes__modal__delete', function () {
    console.log('Confirmation button is clicked > ' + tempNid);

    $.post('/notes/delete/' + tempNid, function(data) {
      location.reload();
    });
  });
}

if(isPage('note')) {
  var margin_px = 100;
  var windowHeight;
  var scroll;

  $(window).scroll(function() {
    loadSections();
  });

  $(document).ready(function() {
    loadSections();
  });

  function loadSections() {
    windowHeight = $(window).height();
    scroll = $(window).scrollTop() + windowHeight;

    loadSection(document.getElementsByClassName('note__section__content'), 0);
  }

  function loadSection(array, index) {
    if(typeof array !== 'undefined' && index < array.length) {

      var current_el = $(array[index]);
      var scroll_top_current_el = current_el.offset().top;

      if(scroll_top_current_el < scroll + margin_px) {

        if(current_el.is('[ns-hidden]')) {
          console.log("Attemp to load section " + index + " with Ajax (" + scroll_top_current_el + " : " + scroll + ")...");

          var n_id = current_el.attr('nid');
          var url = "/notes/" + n_id + "/nsection/" + index;

          current_el.removeAttr('ns-hidden');
          current_el.removeAttr('nid');

          $.post(url, function(response) {
            console.log(response);
            current_el.html(response.content);

            loadSection(array, index +1);
          }, 'json');

        } else {
          loadSection(array, index +1);
        }
      }

    }
  }
}

if(isPage('note-modifier')) {
  var editor = CodeMirror.fromTextArea(document.getElementById('note-modifier__addsection__textarea'), {
    viewportMargin: Infinity,
    lineNumbers: true,
    mode: 'gfm',
    matchBrackets: true,
    smartIndent: true,
    indentWithTabs: true,
    autofocus: true,
    dragDrop: false,
    autoCloseBrackets: true,
    styleActiveLine: true,
    lineWrapping: true,
    continueComments: true,
    extraKeys: {
      "F11": function(cm) {
        cm.setOption("fullScreen", !cm.getOption("fullScreen"));
      },
      "Esc": function(cm) {
        if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
      },
      "Alt-F": "findPersistent"
    }
  });

  hljs.configure({
    classPrefix: 'mkd__code__',
    tabReplace: '<span class="mkd__code__indent">\x09</span>'
  });

  marked.setOptions({
    breaks: true,
    sanitize: true,
    highlight: function(code) {
      return hljs.highlightAuto(code).value;
    }
  });

  $(document).ready(function() {
    updateMarkdown(editor.getValue());
  });

  editor.on('change', function(instance, changeObj) {
    console.log('change');
    updateMarkdown(instance.getValue());
  });
}

function updateMarkdown(value) {
  marked(value, function(err, content) {
    $("#note-modifier__addsection__live").html(content);
  });
}

function isPage($page) {
  return $body.hasClass('page--' + $page );
}

var NTF_CONTEXT = {
  "dir1": "left",
  "dir2": "down",
  "push": "top"
};

function ntf(context, text) {
  PNotify.desktop.permission();

  var opts = {
    hide: false,
    stack: NTF_CONTEXT,
    desktop: {
        desktop: true
    }
  };

  switch (context) {
    case 'e':
      opts.title = "Error";
      opts.text = text;
      opts.type = "error";
      break;

    case 'i':
      opts.title = "Information";
      opts.text = text;
      opts.type = "info";
      break;
  }

  new PNotify(opts);
}
