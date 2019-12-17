// Using AJAX so we can reload the table containing admin info without having to refresh the whole page
// This fxn gets called when user clicks "Delete" button on view admins page

// Send a delete request to viewAdmins page with id that was stored in "Delete" button

function deleteAdmin(id){
    $.ajax({
        url: '/viewAdmins/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    });


};