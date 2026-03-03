package com.sheild.womensafety;

import android.Manifest;
import android.telephony.SmsManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import java.util.ArrayList;

@CapacitorPlugin(
    name = "NativeSms",
    permissions = {
        @Permission(strings = { Manifest.permission.SEND_SMS }, alias = "sms")
    }
)
public class NativeSmsPlugin extends Plugin {

    @PluginMethod
    public void sendSMS(PluginCall call) {
        String to = call.getString("to");
        String message = call.getString("message");

        if (to == null || to.trim().isEmpty()) {
            call.reject("Recipient phone number is required.");
            return;
        }
        if (message == null || message.trim().isEmpty()) {
            call.reject("SMS message body is required.");
            return;
        }
        if (getPermissionState("sms") != PermissionState.GRANTED) {
            call.reject("SMS permission is not granted.");
            return;
        }

        try {
            SmsManager smsManager = SmsManager.getDefault();
            ArrayList<String> parts = smsManager.divideMessage(message);
            smsManager.sendMultipartTextMessage(to, null, parts, null, null);

            JSObject result = new JSObject();
            result.put("sent", true);
            call.resolve(result);
        } catch (Exception ex) {
            call.reject("Failed to send native SMS.", ex);
        }
    }
}

