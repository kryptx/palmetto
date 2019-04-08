var ajv = new Ajv();
var validators = {};

$(function() {
  $.validator.addMethod("jsonSchema", function(value, element, validator) {
    return validators[validator]({ [validator]: value });
  }, 'Value does not match application-provided rules.');

  var fieldsToValidate = Object.keys(validationRules);
  var fieldsToRequire = $('.required-input')
    .map(function() { return $(this).data('iv'); })
    .get();

  var fieldsAllowed = $('.allowed-value')
    .map(function() { return $(this).is(':checked') ? $(this).val() : null })
    .get()
    .filter(function(e) { return e != null; });

  var allProvidedFields = fieldsToRequire.concat(fieldsAllowed);
  var jqueryRules = allProvidedFields.reduce((accumulator, current, idx, num, arr) => {
    var fieldName = 'newValue[' + current + ']';
    if(fieldsToValidate.includes(current)) {
      validators[current] = ajv.compile({ type: 'object', properties: { [current]: validationRules[current] }, required: [ current ] });
      accumulator.rules[fieldName] = {
        required: true,
        jsonSchema: current
      }
    } else {
      accumulator.rules[fieldName] = {
        required: true,
        minlength: 10
      }
    }
    return accumulator;
  }, { rules: {} });

  $('form').validate(jqueryRules);
});
