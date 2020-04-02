$(document).ready(function () {
  console.log("ready!");

  $('.statusChangeBtn').on('click', function () {
    let item = $(this),
      application_id = item.attr('item-id'),
      action = item.attr('action');

    $.ajax({
      type: 'GET',
      url: ('/approve?application_id=' + application_id + '&status=' + action),
      success: (response) => {
        if (response.success) {
          item.parent().html(response.message)
        } else {
          customAlert(response.message, 'error')
        }
      },
      error: (err) => {
        customAlert("Failed to get " + fieldName + "s.", error)
      }
    })
  })
})

function rejectPass(obj) {
  $(obj).closest('.passTableRow').remove(); // or can do refresh afetr api call
}

function acceptPass() {
  $('.acceptSpan').css('display', 'none');
  $('.rejectSpan').css('display', 'none');

  // show generate pdf link
  $('.pdfSpan').css('display', 'inline-block');
}

function printPassPdf(obj) {
  getPdfData(obj);
  var printContents = document.getElementById('#passPdf').innerHTML; // pass the div id to print
  document.body.innerHTML = printContents;
  window.print();
  window.location.reload();
}

function getPdfData(obj) {
  let name = $(obj).closest('.passTableRow').find('.nameItem').text();
  let mobile = $(obj).closest('.passTableRow').find('.mobileItem').text();
  let idType = $(obj).closest('.passTableRow').find('.idTypeItem').text();
  let idNum = $(obj).closest('.passTableRow').find('.idNumItem').text();
  let date = $(obj).closest('.passTableRow').find('.dateItem').text();

  $('.passName').text(name);
  $('.passMobile').text(mobile);
  $('.passIdType').text(idType);
  $('.passIdNumber').text(idNum);
  $('.passDate').text(date);
}