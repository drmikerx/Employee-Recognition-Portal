// Using AJAX so we can reload the table containing general user info without having to refresh the whole page
// This fxn gets called when user clicks "Delete" button on view general users page

// Send a delete request to viewGeneralUsers page with id that was stored in "Delete" button

function deleteGeneralUser(id){
    $.ajax({
        url: '/viewGeneralUsers/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    });


};