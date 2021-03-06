(function(){
  // copied from https://github.com/motdotla/dotenv/blob/master/lib/main.js
  // TODO: include via npm or rails-assets ?
  function parseEnv (src) {
    var obj = {};

    // convert Buffers before splitting into lines and processing
    src.toString().split('\n').forEach(function (line) {
      // matching "KEY' and 'VAL' in 'KEY=VAL'
      var keyValueArr = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
      // matched?
      if (keyValueArr !== null) {
        var key = keyValueArr[1];

        // default undefined or missing values to empty string
        var value = keyValueArr[2] ? keyValueArr[2] : '';

        // expand newlines in quoted values
        var len = value ? value.length : 0;
        if (len > 0 && value.charAt(0) === '"' && value.charAt(len - 1) === '"') {
          value = value.replace(/\\n/gm, '\n');
        }

        // remove any surrounding quotes and extra spaces
        value = value.replace(/(^['"]|['"]$)/g, '').trim();

        obj[key] = value;
      }
    });

    return obj;
  }

  function copyRow($row, callback) {
    var $new_row = $row.clone();
    $new_row.find(':input').val('');

    // each row needs a new unique name and id to make rails do the update logic correctly for environment_variables
    $new_row.find(':input').each(function(i, input){
      var $input = $(input);
      $.each(['id', 'name'], function(i, attr){
        $input.attr(attr, $input.attr(attr).replace(/\d+/, function(n){ return ++n; }));
      });
    });

    if(callback){ callback($new_row); }

    $row.after($new_row);
    $new_row.find(".selectpicker").selectpicker();  // add selectpicker to copied row
    return $new_row;
  }

  function withoutSelectpicker($row, callback){
    var $picker = $row.find('.selectpicker');
    $picker.selectpicker('destroy').addClass('selectpicker'); // normalize existing so they are ready to copy
    callback();
    $picker.selectpicker();  // restore selects
  }

  $(document).on("click", ".duplicate_previous_row", function(e){
    e.preventDefault();
    var $row = $(this).prev();
    withoutSelectpicker($row, function(){
      copyRow($row);
    });
  });

  // let user paste .env files and we parse out everything
  $(document).on("click", ".paste_env_variables", function(e){
    e.preventDefault();

    var pasted = prompt("Paste .env formatted variables here. Fills the form but does not submit. Uses last selected scope.");
    if(!pasted) { return; }
    var env = parseEnv(pasted);

    var $row = $(this).prev().prev();
    var selectedEnv = $row.find("select").val();

    withoutSelectpicker($row, function() {
      // add and fill new rows while they are not select-pickered
      $.each(env, function (k, v) {
        copyRow($row, function($raw_new_row){
          var inputs = $raw_new_row.find(':input');
          $(inputs.get(0)).val(k);
          $(inputs.get(1)).val(v);
          $(inputs.get(2)).val(selectedEnv);
        });
      });
    });
  });
}());
