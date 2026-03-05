package com.sheild.womensafety;

import android.Manifest;
import android.content.Intent;
import android.net.Uri;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

@CapacitorPlugin(
    name = "NativeCall",
    permissions = {
        @Permission(strings = { Manifest.permission.CALL_PHONE }, alias = "call")
    }
)
public class NativeCallPlugin extends Plugin {

    @PluginMethod
    public void callNumber(PluginCall call) {
        String phoneNumber = call.getString("phoneNumber");
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            call.reject("Phone number is required.");
            return;
        }

        if (getPermissionState("call") != PermissionState.GRANTED) {
            call.reject("Call permission is not granted.");
            return;
        }

        try {
            Intent intent = new Intent(Intent.ACTION_CALL);
            intent.setData(Uri.parse("tel:" + phoneNumber));
            getActivity().startActivity(intent);

            JSObject result = new JSObject();
            result.put("called", true);
            call.resolve(result);
        } catch (Exception ex) {
            call.reject("Failed to place native call.", ex);
        }
    }
}

