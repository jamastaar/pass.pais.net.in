var idTypes = {};
$(document).ready(function () {
  // console.log("ready!");
  // dateInput.min = new Date().toISOString().split("T")[0];
  // dateInput.max = "2020-03-31";

  getDistricts();
  getCategoies();

  $('#categorySelect').change(function () {
    getSubCategoies($('#categorySelect').val());
    getIdProofType($('#categorySelect').val())
  })

  $("input:file").on('change', (e) => {
    if (fileSizeValidate(e) == false) {
      return false;
    };
  })

  $('#photoInput').on('change', (e) => {
    if (fileTypeValidate(e) == false) {
      return false;
    };
  })

  // $('#districtSelect').change(function(){
  //   getPS($('#districtSelect').val())
  // })
  // $('#dateInput').change(function(){
  // getSlot($("#thanaSelect").val(), $('#dateInput').val())
  // })

  $('#passFormBtn').on('click', function (e) {
    if ($('#passForm')[0].checkValidity()) {
      if (checkDates() == false) {
        e.preventDefault();
        return false
      }

      $('#passFormBtn').prop('disabled', true);
      $('#passFormBtn').css('opacity', '0.5');

      $('#passForm').submit();
    }
  })

  $('#otpFormBtn').on('click', function (e) {
    if ($('#passForm')[0].checkValidity()) {
      e.preventDefault();
      verifySlot(getFormData($('#passForm')))
    }
  })
  // if ( dateInput.type != 'date' ) $('#dateInput').datepicker();
});

function fileTypeValidate(e) {
  var image = e.currentTarget.files[0];
  if (image != '') {
    var checkimg = image.name.toLowerCase();
    if (!checkimg.match(/(\.jpg|\.png|\.JPG|\.PNG|\.jpeg|\.JPEG)$/)) {
      customAlert("Please enter Image File Extensions .jpg, .png, .jpeg", 'error');
      $(e.target).val('');
      return false;
    }
  }
  return true;
}

function fileSizeValidate(e) {
  var file = e.currentTarget.files[0];
  if (file != '') {
    if (Math.round(file.size / (1024 * 1024)) > 5) {
      customAlert('Please select image size less than 5 MB', 'error');
      $(e.target).val('');
      return false;
    }
  }
  return true;
}

function checkDates() {
  let from_date = $('.dateFromInput').val(),
    to_date = $('.dateToInput').val();

  if ((Date.parse(from_date) > Date.parse(to_date))) {
    customAlert("To Date should be greater than From Date", 'error');
    return false;
  }
  return true;
}

function getIdProofType(idVal) {
  let value = 'Attach supporting documents like ' + (idTypes[idVal] ? idTypes[idVal] : 'ID Proof') + ' *';
  $('#proofSelectLabel').text(value)
}

function verifySlot(passData) {
  $.ajax({
    data: JSON.stringify(passData),
    url: '/verify-otp',
    type: 'post',
    dataType: 'json',
    contentType: 'application/json',
    beforeSend: function (xhr, settings) {
      xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'))
    },
    success: (res) => {
      if (res.success) {
        $('#passForm').hide()
        customAlert('Pass details sent to your mobile.', 'success')
      } else {
        customAlert(res.message, 'error')
      }
    },
    error: (err) => { }
  })
}


function bookSlot(passData) {
  $.ajax({
    data: JSON.stringify(passData),
    url: '/apply',
    type: 'post',
    dataType: 'json',
    contentType: 'application/json',
    beforeSend: function (xhr, settings) {
      xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'))
    },
    success: (res) => {
      if (res.success) {
        $('#otp').prop('disabled', false)
        $('#applicatId').val(res.applicant_id)
        $('#otp').show()
        $('#passFormBtn').hide()
        $('#otpFormBtn').show()
        customAlert('OTP Generated and sent to your mobile.', 'success')
      } else {
        customAlert(res.message, 'error')
      }
    },
    error: (err) => { }
  })
}

function getCookie(c_name) {
  if (document.cookie.length > 0) {
    c_start = document.cookie.indexOf(c_name + "=");
    if (c_start != -1) {
      c_start = c_start + c_name.length + 1;
      c_end = document.cookie.indexOf(";", c_start);
      if (c_end == -1) c_end = document.cookie.length;
      return unescape(document.cookie.substring(c_start, c_end));
    }
  }
  return "";
}

function fillSelectItem(response, selectId, fieldName) {
  var len = response.length;
  $("#" + selectId).empty();
  $("#" + selectId).append('<option disabled="" value=""> -- Select ' + fieldName + ' --</option>');
  for (var i = 0; i < len; i++) {
    var id = response[i]['id'];
    var name = response[i]['name'];
    $("#" + selectId).append("<option value='" + id + "'>" + name + "</option>");
  }
}

function fillInfo(url, selectId, fieldName, errorMessage = null, callBack = null) {
  $.ajax({
    type: 'GET',
    url,
    beforeSend: function (xhr, settings) {
      // xhr.setRequestHeader("X-CSRFToken", csrftoken)
    },
    success: (response) => {
      var len = response.length;
      fillSelectItem(response, selectId, fieldName)
      if (errorMessage !== null && len == 0) {
        customAlert(errorMessage, 'error')
      }
      if (callBack) {
        callBack(response)
      }
      $("#" + selectId).trigger("change")
    },
    error: (err) => {
      customAlert("Failed to get " + fieldName + "s.", error)
    }
  })
}

function getDistricts() {
  fillInfo('/districts', 'districtSelect', 'District', null, (response) => {
    fillSelectItem(response, 'placeToInput', 'District')
    fillSelectItem(response, 'placeFromInput', 'District')
  })
}

function getCategoies() {
  fillInfo('/categories', 'categorySelect', 'Category', null, (response) => {
    response.map((item) => {
      idTypes[item.id] = item.proof_string
    })
  })
}

function getSubCategoies(categoryId) {
  if (!categoryId) { return }
  fillInfo("/sub-categories?category=" + categoryId,
    'subCategorySelect',
    'Sub Category',
    null, (response) => {
      if (response.length == 0) {
        $('#subCategorySelect').parent().hide()
      } else {
        $('#subCategorySelect').parent().show()
      }
    })
}

function getPS(districtId) {
  fillInfo("/thanas?district_id=" + districtId, 'thanaSelect', 'Police Station')
}

function getSlot(thanaId, date) {
  fillInfo("/slots?thana_id=" + thanaId + "&date=" + date, 'slotSelect', 'Slot', 'No vacant slots available.')
}

function showOtpInput() {
  $('.otpInputCol').css('display', 'inline-block');
  $('.submitDetailsBtn').text('SUBMIT OTP')
}

function resetOtpBtn() {
  $('.otpInputCol').css('display', 'none');
  $('.submitDetailsBtn').text('GET OTP')
}


function showResult() {
  $('.resultDiv').css('display', 'block');
}

function printPdf(parentId) {
  var printContents = document.getElementById(parentId).innerHTML;
  document.body.innerHTML = printContents;
  window.print();
  window.location.reload();
}

function getFormData($form) {
  var unindexed_array = $form.serializeArray();
  var indexed_array = {};

  $.map(unindexed_array, function (n, i) {
    indexed_array[n['name']] = n['value'];
  });

  return indexed_array;
}

function validateForm() {
  let validateFlag = true;
  if ($('input').val() == '') {
    customAlert('Input is empty', 'error');
    validateFlag = false;
    return validateFlag;
  }
  if ($('textarea').val() == '') {
    customAlert('Textarea is empty', 'error');
    validateFlag = false;
    return validateFlag;
  }
  if ($('select').val() == '') {
    customAlert('select box is empty', 'error');
    validateFlag = false;
    return validateFlag;
  }
  return validateFlag;
}

function customAlert(message, type) {
  let alertcolor = '';
  switch (type) {
    case 'success': alertcolor = '#26c45a'; break;
    case 'error': alertcolor = '#d45a5a';
  }
  iziToast.success({
    title: 'OK',
    message,
    backgroundColor: alertcolor,
    titleColor: "#fff",
    messageColor: "#fff",
    iconColor: "#fff",
    color: "#fff",
    overlayColor: "#fff",
    position: 'topRight',
    progressBarColor: "#fff",
    timeout: 2500,
    close: false,
    iconUrl: '/static/assets/images/close.svg',
    title: ''
  });
}