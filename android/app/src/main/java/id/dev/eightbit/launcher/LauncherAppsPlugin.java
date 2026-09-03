package id.dev.eightbit.launcher;

import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.List;

@CapacitorPlugin(name = "LauncherApps")
public class LauncherAppsPlugin extends Plugin {

    @PluginMethod
    public void listApps(PluginCall call) {
        JSArray apps = new JSArray();
        try {
            PackageManager pm = getContext().getPackageManager();
            List<ApplicationInfo> installed = pm.getInstalledApplications(PackageManager.GET_META_DATA);
            for (ApplicationInfo info : installed) {
                Intent launchIntent = pm.getLaunchIntentForPackage(info.packageName);
                if (launchIntent == null) continue;
                if (info.packageName.equals(getContext().getPackageName())) continue;

                JSObject app = new JSObject();
                app.put("packageName", info.packageName);
                app.put("label", String.valueOf(pm.getApplicationLabel(info)));
                app.put("system", (info.flags & ApplicationInfo.FLAG_SYSTEM) != 0);
                apps.put(app);
            }
            JSObject ret = new JSObject();
            ret.put("apps", apps);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to list apps: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void launchApp(PluginCall call) {
        String packageName = call.getString("packageName");
        if (packageName == null) {
            call.reject("packageName required");
            return;
        }
        try {
            PackageManager pm = getContext().getPackageManager();
            Intent launchIntent = pm.getLaunchIntentForPackage(packageName);
            if (launchIntent == null) {
                call.reject("App not launchable: " + packageName);
                return;
            }
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(launchIntent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to launch: " + e.getMessage(), e);
        }
    }
}
